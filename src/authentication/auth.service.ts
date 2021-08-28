import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtDTO, JwtResponseDTO, CredentialsDTO, RegistrationDTO, RequestRecoveryDTO, RecoveryDTO } from './auth.entity';
import bcrypt from "bcrypt"
import { CredentialsMismatchException } from 'src/errors/credentialsMismatchException';
import { SessionExpiredException } from 'src/errors/sessionExpiredException';
import { Account, AccountType } from 'src/account/account.entity';
import { ServiceService } from '../services/service.service';
import { UserService } from 'src/users/user.service';
import { User } from 'src/users/user.entity';

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private userService: UserService,
        private serviceService: ServiceService
    ){}

    public encodePassword(password: string): string {
        return bcrypt.hashSync(password, 10);
    }

    public comparePasswords(password: string, hashedPassword: string): boolean {
        return bcrypt.compareSync(password, hashedPassword);
    }

    public async signInWithCredentials(credentials: CredentialsDTO): Promise<JwtResponseDTO> {
        let account: Account;
        if(credentials.accountType == AccountType.USER) {
            // Login as user
            account = await this.userService.findByEmailOrUsername(credentials.identifier, credentials.identifier, true);
            if(!account) throw new NotFoundException();

            if(!this.comparePasswords(credentials.password, (account as User).password)) {
                throw new CredentialsMismatchException();
            }
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
    public async signInWithToken(authorizationHeaderValue: string): Promise<Account> {
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
        if(!authorizationHeaderValue.toLowerCase().startsWith("bearer")) {
            throw new BadRequestException();
        }

        return authorizationHeaderValue.slice(7, authorizationHeaderValue.length);
    }

    /**
     * Authorize the processed jwt. Returns account information on success.
     * @param token Decoded jwt object
     * @returns Account object
     */
    public async authorizeDecodedToken(token: JwtDTO): Promise<Account> {
        if(token.accountType == AccountType.USER) {
            return this.userService.findById(token.id)
        } else {
            return this.serviceService.findById(token.id);
        }
    }

    /**
     * Sign a new jwt for a login attempt.
     * @param account Account to sign the jwt for.
     * @param stayLoggedIn Specifiy if the jwt should expire after 7 days or not. If true, the token never expires.
     * @returns JwtResponseDTO object
     */
    private async issueJwt(account: Account, stayLoggedIn = false): Promise<JwtResponseDTO> {
        const tokenDTO: JwtDTO = { id: account.id, accountType: account.accountType }
        const expiresIn: number = Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7);
        if(!stayLoggedIn) tokenDTO.exp = expiresIn;
        
        return {
            token: this.jwtService.sign(tokenDTO),
            expiresAt: new Date(Date.now() + expiresIn),
            issuedAt: new Date(),
            issuedTo: account
        }
    }

    public async register(registration: RegistrationDTO) {
        return
    }

    public async recover(recovery: RecoveryDTO) {
        return
    }

    public async requestRecovery(recovery: RequestRecoveryDTO) {
        return
    }

}
