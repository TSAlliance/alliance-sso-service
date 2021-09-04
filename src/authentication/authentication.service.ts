import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtDTO, JwtResponseDTO, CredentialsDTO, RegistrationDTO, RequestRecoveryDTO, RecoveryDTO, AccountRecoveryToken, ChangePasswordDTO } from './authentication.entity';
import { CredentialsMismatchException } from 'src/errors/credentialsMismatchException';
import { SessionExpiredException } from 'src/errors/sessionExpiredException';
import { Account, AccountType } from 'src/account/account.entity';
import { ServiceService } from '../services/service.service';
import { UserService } from 'src/users/user.service';
import { User } from 'src/users/user.entity';
import { RecoveryTokenRepository } from './authentication.repository';
import { PasswordService } from './password.service';
import { ValidationException } from '@tsalliance/rest';
import { InviteService } from 'src/invite/invite.service';
import { Service } from 'src/services/service.entity';
import { Invite } from 'src/invite/invite.entity';

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private userService: UserService,
        private serviceService: ServiceService,
        private passwordService: PasswordService,
        private recoveryTokenRepository: RecoveryTokenRepository,
        private inviteService: InviteService
    ){}

    public async signInWithCredentials(credentials: CredentialsDTO): Promise<JwtResponseDTO> {
        let account: Service | User;
        if(credentials.accountType == AccountType.USER) {
            // Login as user
            account = await this.userService.findByEmailOrUsername(credentials.identifier, credentials.identifier, true);
            console.log(account)
            if(!account) throw new NotFoundException();

            if(!this.passwordService.comparePasswords(credentials.password, (account as User).password)) {
                throw new CredentialsMismatchException();
            }

            console.log((account as User).role)
            account = (account as User).censored();
        } else {
            // Login as service
            credentials.stayLoggedIn = true

            // If account type is SERVICE, treat identifier and password as clientId and clientSecret
            const clientId = credentials.identifier;
            const clientSecret = credentials.password;

            account = await this.serviceService.findByCredentials(clientId, clientSecret);
            if(!account) throw new NotFoundException();
        }

        return this.issueJwt(account, credentials.stayLoggedIn);
    }

    /**
     * Validate the provided string encoded jwt and return account information on success.
     * @param token JWT encoded as string.
     * @returns Account object
     */
    public async signInWithToken(authorizationHeaderValue: string): Promise<Service | User> {
        const token = this.processAuthorizationValue(authorizationHeaderValue);
        const decoded: JwtDTO = this.jwtService.decode(token) as JwtDTO;
        
        if(!decoded || (decoded.exp && decoded.exp <= Date.now())) {
            throw new SessionExpiredException();
        }

        return this.authorizeDecodedToken(decoded);
    }

    /**
     * Process the authorization header value and return string containing the extracted jwt.
     * @param authorizationHeaderValue String containing the authorization header value.
     * @returns String containing the extracted jwt.
     */
    private processAuthorizationValue(authorizationHeaderValue: string): string {
        if(!authorizationHeaderValue?.toLowerCase().startsWith("bearer")) {
            throw new BadRequestException();
        }

        return authorizationHeaderValue.slice(7, authorizationHeaderValue.length);
    }

    /**
     * Authorize the processed jwt. Returns account information on success.
     * @param token Decoded jwt object
     * @returns Account object
     */
    public async authorizeDecodedToken(token: JwtDTO): Promise<Service | User> {
        let account: Service | User;
        if(token.accountType == AccountType.USER) {
            account = await this.userService.findById(token.id)
        } else {
            account = await this.serviceService.findById(token.id);
        }

        // Check if credentials have changed, so that the jwt can get rejected
        // and a new one must be obtained by signInWithCredentials()
        if(token.credentialHash != account.credentialHash) {
            throw new SessionExpiredException()
        }

        return account;
    }

    /**
     * Sign a new jwt for a login attempt.
     * @param account Account to sign the jwt for.
     * @param stayLoggedIn Specifiy if the jwt should expire after 7 days or not. If true, the token never expires.
     * @returns JwtResponseDTO object
     */
    private async issueJwt(account: Service | User, stayLoggedIn = false): Promise<JwtResponseDTO> {
        const tokenDTO: JwtDTO = { id: account.id, accountType: (account instanceof User ? AccountType.USER : AccountType.SERVICE), credentialHash: account.credentialHash }
        const expiresIn: number = Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7);
        if(!stayLoggedIn) tokenDTO.exp = expiresIn;
        
        return {
            token: this.jwtService.sign(tokenDTO),
            expiresAt: new Date(Date.now() + expiresIn),
            issuedAt: new Date(),
            issuedTo: account
        }
    }

    /**
     * Register user
     * @param registration Registration Data 
     */
    public async register(registration: RegistrationDTO) {   
        const invite = await this.inviteService.findById(registration.inviteCode);
        if(!invite || !this.inviteService.isInviteValid(invite)) throw new BadRequestException();

        await this.userService.createUser({
            email: registration.email,
            username: registration.username,
            password: registration.password,
            discordId: registration.discordId,
            role: invite.asignRole
        });

        invite.uses++;
        if(!this.inviteService.isInviteValid(invite)) {
            await this.inviteService.deleteInvite(invite.id)
        } else {
            await this.inviteService.save(invite);
        }
    }

    /**
     * Request account recovery for user. This will send an email to the user containing a reset link.
     * @param recovery RecoveryDTO containing mainly the email address.
     */
    public async requestRecovery(recovery: RequestRecoveryDTO) {
        const user = await this.userService.findByEmail(recovery.email);
        await this.recoveryTokenRepository.save(new AccountRecoveryToken(user));
    }

    /**
     * Recover an user account by setting a new password and verify the request using the recovery token.
     * @param recovery RecoveryDTO containing the token and new password.
     */
    public async recover(recovery: RecoveryDTO) {
        const token: AccountRecoveryToken = await this.recoveryTokenRepository.findOneOrFail({ where: { token: recovery.token }, relations: ["user"]})
        const user = token.user;

        // Check if new password is old password
        if(this.passwordService.comparePasswords(recovery.password, user.password)) {
            throw new ValidationException([{ fieldname: "password", errors: [
                    { name: "match", expected: false, found: true }
                ]}
            ])
        }
        
        await this.recoveryTokenRepository.manager.transaction(async() => {
            await this.updatePassword(token.user.id, recovery.password);
            await this.recoveryTokenRepository.delete({ token: recovery.token })
        })
    }

    /**
     * Change password of an user account.
     * @param userId User's id
     * @param data Password data
     */
    public async changeCredentials(userId: string, data: ChangePasswordDTO) {
        // Check if passwords aren't the same
        if(data.currentPassword == data.newPassword) {
            throw new ValidationException([{ fieldname: "newPassword", errors: [
                    { name: "unique", expected: true, found: false }
                ]}
            ])
        }

        // TODO: @Authentication() Decorator to inject auth object when calling the route

        // Compare password to verify request
        const user = await this.userService.findById(userId, true);
        if(!this.passwordService.comparePasswords(data.currentPassword, user.password)) {
            throw new ValidationException([{ fieldname: "currentPassword", errors: [
                    { name: "match", expected: true, found: false }
                ]}
            ])
        }

        // Update password
        await this.updatePassword(userId, data.newPassword)
    }

    /**
     * Update password using userService's update method
     * @param userId User's id
     * @param password Updated password
     */
    private async updatePassword(userId: string, password: string) {
        await this.userService.updateUser(userId, {
            email: undefined,
            username: undefined,
            password
        })
    }

}
