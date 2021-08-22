import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/user.entity';
import { UserService } from 'src/users/user.service';
import { JwtDTO, JwtResponseDTO, CredentialsDTO } from './auth.model';
import bcrypt from "bcrypt"
import { CredentialsMismatchException } from 'src/errors/credentialsMismatchException';
import { SessionExpiredException } from 'src/errors/sessionExpiredException';
import { Account, AccountType } from 'src/account/account.entity';
import { AuthCodeRepository } from './auth.repository';

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private userService: UserService,
        private authRepository: AuthCodeRepository
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

            const clientId = credentials.identifier;
            const clientSecret = credentials.password;

            // TODO
        }

        return this.issueJwt(account, credentials.stayLoggedIn);
    }

    public async signInWithToken(token: string): Promise<Account> {
        const decoded: JwtDTO = this.jwtService.decode(token) as JwtDTO;
        
        if(decoded.exp && decoded.exp <= Date.now()) {
            throw new SessionExpiredException();
        }

        // Return user if accountType is USER
        if(decoded.accountType == AccountType.USER) {
            const user: User = await this.userService.findById(decoded.id);
            if(!user) throw new NotFoundException();
            return user;
        }

        // Else return service
        // TODO
        return null;
    }

    public async authorizeToken(code: string): Promise<JwtResponseDTO> {
        const authCode = await this.authRepository.findOne({ where: { code }, relations: ["account"] });
        if(!authCode) throw new NotFoundException();

        const account = null// authCode.account;
        return this.issueJwt(account, false);
    }

    private async issueJwt(account: Account, stayLoggedIn?: boolean): Promise<JwtResponseDTO> {
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

}
