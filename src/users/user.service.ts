import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { RandomUtil, Validator } from '@tsalliance/rest';
import { Page, Pageable } from 'nestjs-pager';
import { PasswordService } from 'src/authentication/password.service';
import { MediaService } from '../media/media.service';
import { User, UserDTO } from './user.entity';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {

    constructor(
        @Inject(forwardRef(() => MediaService)) private mediaService: MediaService,
        private passwordService: PasswordService,
        private userRepository: UserRepository
    ){}

    public async save(user: User): Promise<User> {
        return this.userRepository.save(user);
    }

    public async findAll(pageable: Pageable): Promise<Page<User>> {
        const result = await this.userRepository.findAll(pageable);
        result?.elements.map((value) => value.censored())
        return result;
    }

    public async findById(userId: string, withSensitive = false): Promise<User> {
        const result = await this.userRepository.findOne({ where: { id: userId }});
        if(!withSensitive) {
            return result?.censored();
        }
        return result;
    }

    public async findByEmail(email: string, withSensitive = false): Promise<User> {
        const result = await this.userRepository.findOne({ where: { email }});
        if(!withSensitive) {
            return result?.censored();
        }
        return result;
    }

    public async findByEmailOrUsername(email: string, username: string, withSensitive = false): Promise<User> {
        const result = await this.userRepository.findOne({ where: [{ username },{ email }]})
        if(!withSensitive) {
            return result?.censored();
        }
        return result;
    }

    public async createUser(data: UserDTO): Promise<User> {
        const validator = new Validator();
        const existsByUsername = await this.existsByUsername(data.username);
        const existsByEmail = await this.existsByEmail(data.email);

        validator.text("username", data.username).alphaNum().minLen(3).maxLen(32).required().unique(() => existsByUsername).check();
        validator.email("email", data.email).required().unique(() => existsByEmail).check();
        validator.password("password", data.password).required().check();
        validator.throwErrors();

        const user = new User();
        user.username = data.username;
        user.email = data.email;
        user.password = this.passwordService.encodePassword(data.password);
        user.discordId = data.discordId;
        user.allowedServices = data.allowedServices;
        const result = await (await this.userRepository.save(user)).censored();

        try {
            const avatarSvgData = this.mediaService.generateAvatar(data.username + Date.now());
            const avatarResourceInfo = await this.mediaService.setUserAvatar(result.id, avatarSvgData);
    
            result.avatarResourceUri = avatarResourceInfo.resourceUri;
            result.avatarResourceId = avatarResourceInfo.resourceId;
        } catch (err) {
            // Do nothing -> Silently fail
            console.log(err);
        }

        return result;
    }

    public async updateUser(userId: string, userData: UserDTO): Promise<User> {
        const user: User = await this.findById(userId);
        if(!user) throw new NotFoundException();

        const validator = new Validator();
        const existsByUsername = await this.existsByUsername(userData.username);
        const existsByEmail = await this.existsByEmail(userData.email);

        if(userData.username && validator.text("username", userData.username).alphaNum().minLen(3).maxLen(32).unique(() => existsByUsername).check()) {
            user.username = userData.username;
        }
        if(userData.email && validator.email("email", userData.username).unique(() => existsByEmail).check()) {
            user.email = userData.email;
        }
        if(userData.password && validator.password("password", userData.password).check()) {
            user.password = this.passwordService.encodePassword(userData.password);
            user.credentialHash = RandomUtil.randomCredentialHash()
        }

        validator.throwErrors();
        return this.userRepository.save(user);
    }

    public async deleteUser(userId: string) {
        return this.userRepository.manager.transaction(async () => {
            const user = await this.findById(userId);
            const result = await this.userRepository.delete(user);

            this.mediaService.deleteAvatar(user.avatarResourceId)
            return result;
        })
    }

    public async existsByUsername(username: string): Promise<boolean> {        
        return this.userRepository.exists({ username });
    }

    public async existsByEmail(email: string): Promise<boolean> {
        return this.userRepository.exists({ email });
    }

}
