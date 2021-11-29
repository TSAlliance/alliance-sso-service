import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CredentialsMismatchException } from '@tsalliance/rest';
import { DeleteResult } from 'typeorm';
import { AccountType } from 'src/account/account.entity';
import { InviteService } from 'src/invite/invite.service';
import { MailService } from 'src/mail/mail.service';
import { Service } from 'src/services/service.entity';
import { ServiceService } from 'src/services/service.service';
import { User } from 'src/users/user.entity';
import { UserService } from 'src/users/user.service';
import { AccessTokenDTO } from './dto/accessToken.dto';
import { CreateAuthenticationDTO } from './dto/create-authentication.dto';
import { CreateAuthorizationDTO } from './dto/create-authorization.dto';
import { RecoveryRequestDTO } from './dto/recover-request.dto';
import { RegistrationDTO } from './dto/registration.dto';
import { Authentication } from './entities/authentication.entity';
import { Authorization } from './entities/authorization.entity';
import { GrantCode } from './entities/grantCode.entity';
import { PasswordService } from './password.service';
import { GrantCodeRepository } from './repositories/grantCode.repository';
import { RecoveryTokenRepository } from './repositories/recoveryToken.repository';
import { AccountRecoveryToken } from './entities/recoveryToken.entity';
import { UpdatePasswordDTO } from './dto/update-password.dto';
import { RecoverAccountDTO } from './dto/recover-account.dto';

@Injectable()
export class AuthenticationService {

    constructor(
        private userService: UserService,
        private passwordService: PasswordService,
        private jwtService: JwtService,
        private inviteService: InviteService,
        private serviceService: ServiceService,
        private mailService: MailService,
        private grantCodeRepository: GrantCodeRepository,
        private recoveryTokenRepository: RecoveryTokenRepository
    ) {}

    /**
     * Request grantCode for requesting accessTokens.
     * @param createAuthenticationDto Data needed to issue grantCode
     */
    public async authenticate(createAuthenticationDto: CreateAuthenticationDTO): Promise < Authentication > {
        let account: User;

        const grantCode = new GrantCode();
        grantCode.clientId = createAuthenticationDto.clientId;
        grantCode.accountType = AccountType.USER;
        grantCode.stayLoggedIn = createAuthenticationDto.stayLoggedIn;

        // Check if redirect_uri matches client_id of service.
        // If not, reject authentication request.
        if (!this.serviceService.hasRedirectUri(createAuthenticationDto.clientId, createAuthenticationDto.redirectUri)) {
            throw new BadRequestException("Invalid redirect uri.")
        }

        // Check if there already is a valid accessToken available and check if it is still functional.
        // If everything is fine, proceed and create a new grantCode.
        if (createAuthenticationDto.useExistingAccessToken) {
            const accessTokenDto = await this.decodeAccessToken(createAuthenticationDto.useExistingAccessToken);
            account = await this.authenticateAccessToken(accessTokenDto) as User;
            
            if(!account) throw new BadRequestException("Your account does not exist.");
        } else {
            // Find user by provided login credentials
            // If account does not exist, throw error.
            account = await this.userService.findByEmailOrUsername(createAuthenticationDto.identifier, createAuthenticationDto.identifier);
            if (!account) throw new BadRequestException("Your account does not exist.");

            // Compare provided password with the save password in the database.
            // Throw error if they don't match
            if (!this.passwordService.comparePasswords(createAuthenticationDto.password, account.password)) {
                throw new CredentialsMismatchException();
            }
        }

        // Save new grantCode
        grantCode.accountId = account.id
        return this.grantCodeRepository.save(grantCode);
    }

    /**
     * Request an accessToken by passing in the grantCode.
     * @param createAuthorizationDto Authorization Data like grantCode
     * @returns Authorization
     */
    public async authorize(createAuthorizationDto: CreateAuthorizationDTO): Promise < Authorization > {
        const grantCode = await this.grantCodeRepository.findOne({ where: { grantCode: createAuthorizationDto.grantCode }});
        if(!grantCode) throw new BadRequestException("Invalid grant code.");

        if(!await this.serviceService.hasRedirectUri(grantCode.clientId, createAuthorizationDto.redirectUri)) {
            throw new BadRequestException("Invalid redirect_uri.");
        }

        const account = await this.userService.findById(grantCode.accountId)
        if(!account) throw new BadRequestException("Your account does not exist.");

        const expiresAt = grantCode.stayLoggedIn ? undefined : new Date(Date.now() + (1000 * 60 * 60 * 24 * 7));
        const authorization = new Authorization(await this.generateAccessToken(grantCode, account.credentialHash), expiresAt);

        await this.grantCodeRepository.delete({ accountId: grantCode.accountId });
        return authorization;
    }

    /**
     * Decode jwt string to AccessToken object
     * @param accessTokenString Jwt string to decode
     * @returns AccessTokenDTO
     */
    public async decodeAccessToken(accessTokenString: string): Promise < AccessTokenDTO > {
        if(!accessTokenString) return null;
        if(accessTokenString.startsWith("Bearer")) accessTokenString = accessTokenString.slice(7, accessTokenString.length);
        return this.jwtService.decode(accessTokenString) as AccessTokenDTO
    }

    /**
     * Authenticate a decoded accessToken and return account data
     * @param accessTokenDto Decoded data
     * @returns Service | User
     */
    public async authenticateAccessToken(accessTokenDto: AccessTokenDTO): Promise <Service | User> {
        let account: Service | User;

        try {
            if (accessTokenDto.accountType == AccountType.USER) {
                account = Object.assign(new User(), await this.userService.findByIdOrFail(accessTokenDto.accountId))
            } else {
                account = Object.assign(new Service(), await this.serviceService.findByIdOrFail(accessTokenDto.accountId))
            }
        } catch (err) {
            throw new NotFoundException("You account does not exist.");
        }

        // Check if credentials have changed or the token is expired, so that the jwt can get rejected
        // and a new one must be obtained by signInWithCredentials()
        if (accessTokenDto.credentialHash != account.credentialHash || (accessTokenDto.exp <= Date.now())) {
            throw new UnauthorizedException("Access token expired.")
        }

        return account;
    }

    /**
     * Generate a new access token for account
     * @param grantCode GrantCode thats holding the data to generate accessToken
     * @param credentialHash Credential Hash. This will invalidate the token, if account has changed its login credentials.
     * @param stayLoggedIn Specify if the accessToken should expire after 7 days or not.
     * @returns String encoded jwt
     */
    public async generateAccessToken(grantCode: GrantCode, credentialHash: string): Promise < string > {
        const tokenDTO: AccessTokenDTO = {
            accountId: grantCode.accountId,
            accountType: grantCode.accountType,
            credentialHash
        }
        const expiresAt: Date = (grantCode.stayLoggedIn ? undefined : new Date(Date.now() + (1000 * 60 * 60 * 24 * 7)));

        if (!grantCode.stayLoggedIn) tokenDTO.exp = expiresAt.getTime();
        return this.jwtService.sign(tokenDTO)
    }

    /**
     * Register new user. Creating new service accounts must be handled via different service
     * @param registration Registration Data 
     * @returns void. But throws error on failure
     */
    public async register(registration: RegistrationDTO) {   
        const invite = await this.inviteService.findByIdIncludingRelations(registration.inviteCode);
        if(!invite || !this.inviteService.isInviteValid(invite)) throw new BadRequestException("Invalid invite code.");

        await this.userService.create({
            email: registration.email,
            username: registration.username,
            password: registration.password,
            role: invite.assignRole
        });

        invite.uses++;
        if(!this.inviteService.isInviteValid(invite)) {
            await this.inviteService.delete(invite.id)
        } else {
            await this.inviteService.update(invite.id, invite);
        }
    }

    /**
     * Change password of an user account.
     * @param userId User's id
     * @param data Password data
     */
    public async changePassword(userId: string, data: UpdatePasswordDTO) {
        // Compare password to verify request
        const user = await this.userService.findById(userId);
        if(!this.passwordService.comparePasswords(data.currentPassword, user.password)) {
            throw new CredentialsMismatchException()
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
        await this.userService.update(userId, {
            email: undefined,
            username: undefined,
            password
        })
    }

    /**
     * Request account recovery for user. This will send an email to the user containing a reset link.
     * @param recovery RecoveryDTO containing mainly the email address.
     */
     public async requestRecovery(recovery: RecoveryRequestDTO) {
        const user = await this.userService.findByEmail(recovery.email);
        if(!user) return;

        if(await this.hasRecoveryToken(user.id)) {
            await this.deleteRecoveryTokenOfUser(user.id);
        }
        
        const recoveryToken = new AccountRecoveryToken();
        recoveryToken.user = user;

        const result = await this.recoveryTokenRepository.save(recoveryToken)
        await this.mailService.sendRecoveryMail({ token: result })
    }

    /**
     * Recover an user account by setting a new password and verify the request using the recovery token.
     * @param recovery RecoveryDTO containing the token and new password.
     */
     public async recover(recovery: RecoverAccountDTO) {
        const token: AccountRecoveryToken = await this.recoveryTokenRepository.findOneOrFail({ where: { code: recovery.token }, relations: ["user"]})
        if(!token) throw new BadRequestException();

        if(!token.isValid()) {
            await this.deleteRecoveryToken(token.code)
        } else {
            const user = token.user;

            // Check if new password is old password
            if(this.passwordService.comparePasswords(recovery.password, user.password)) {
                throw new BadRequestException("New password shall not be old password.")
            }
            
            await this.recoveryTokenRepository.manager.transaction(async() => {
                await this.updatePassword(token.user.id, recovery.password);
                await this.deleteRecoveryToken(token.code)
            })
        }
    }

    /**
     * Check if an user account already has a recovery requested
     * @param id Id of the user to lookup
     * @returns Promise of type boolean
     */
     public async hasRecoveryToken(userId: string): Promise<boolean> {
        return !!(await this.recoveryTokenRepository.findOne({
            user: { id: userId }
        }));
    }

    /**
     * Delete a recovery token.
     * @param token Token value to delete
     * @returns Promise of type DeleteResult
     */
    public async deleteRecoveryToken(token: string): Promise<DeleteResult> {
        return this.recoveryTokenRepository.delete({ code: token })
    }

    /**
     * Delete all tokens of user.
     * @param userId The user to delete tokens off
     * @returns Promise of type DeleteResult
     */
    public async deleteRecoveryTokenOfUser(userId: string): Promise<DeleteResult> {
        return this.recoveryTokenRepository.delete({ user: { id: userId } })
    }
    
}
