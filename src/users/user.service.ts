import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { RandomUtil, Validation, Validator } from '@tsalliance/rest';
import { PasswordService } from 'src/authentication/password.service';
import { MediaService } from '../media/media.service';
import { User, UserDTO } from './user.entity';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {

    constructor(
        @Inject(forwardRef(() => MediaService)) private mediaService: MediaService,
        private passwordService: PasswordService,
        private userRepository: UserRepository,
    ){        
    }

    public async save(user: User): Promise<User> {
        return this.userRepository.save(user);
    }

    public async findById(userId: string, withSensitive = false): Promise<User> {
        const attributes: (keyof User)[] = [ "id", "email", "username" ];
        if(withSensitive) attributes.push("password");        

        return this.userRepository.findOne(userId, { select: attributes });
    }

    public async findByEmail(email: string, withSensitive = false): Promise<User> {
        const attributes: (keyof User)[] = [ "id", "email", "username" ];
        if(withSensitive) attributes.push("password");

        return this.userRepository.findOne({ where: { email }, select: attributes });
    }

    public async findByEmailOrUsername(email: string, username: string, withSensitive = false): Promise<User> {
        const attributes: (keyof User)[] = [ "id", "email", "username" ];
        if(withSensitive) attributes.push("password");

        return this.userRepository.createQueryBuilder().where(`username = :username OR email = :email`, { username, email }).getOne();
    }

    public async createUser(data: UserDTO, @Validation() validator?: Validator): Promise<User> {
        const existsByUsername = await this.existsByUsername(data.username);
        const existsByEmail = await this.existsByEmail(data.email);

        validator.text("username", data.username).alphaNum().minLen(3).maxLen(32).required().unique(() => existsByUsername).check();
        validator.email("email", data.email).required().unique(() => existsByEmail).check();
        validator.password("password", data.password).required().check();
        validator.throwErrors();

        const result = await this.userRepository.save(new User(data.username, data.email, this.passwordService.encodePassword(data.password)));
        delete result.password;

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

    public async updateUser(userId: string, userData: UserDTO, @Validation() validator?: Validator): Promise<User> {
        const user: User = await this.findById(userId);
        if(!user) throw new NotFoundException();

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
        return this.userRepository.exists({ where: {username}});
    }

    public async existsByEmail(email: string): Promise<boolean> {
        return this.userRepository.exists({ where: {email}});
    }

}
