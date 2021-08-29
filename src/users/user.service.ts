import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Validator } from '@tsalliance/rest';
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
        private validator: Validator
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

    public async createUser(data: UserDTO): Promise<User> {
        const existsByUsername = await this.existsByUsername(data.username);
        const existsByEmail = await this.existsByEmail(data.email);

        this.validator.text("username", data.username).alphaNum().minLen(3).maxLen(32).required().unique(() => existsByUsername).check();
        this.validator.email("email", data.email).required().unique(() => existsByEmail).check();
        this.validator.password("password", data.password).required();
        this.validator.throwErrors();

        const result = await this.userRepository.save(new User(data.username, data.email, this.passwordService.encodePassword(data.password)));
        delete result.password;

        try {
            const avatarSvgData = this.mediaService.generateAvatar(data.username + Date.now());
    
            console.log(result);
            console.log(avatarSvgData);
    
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

        const existsByUsername = await this.existsByUsername(userData.username);
        const existsByEmail = await this.existsByEmail(userData.email);

        if(userData.username && this.validator.text("username", userData.username).alphaNum().minLen(3).maxLen(32).unique(() => existsByUsername).check()) {
            user.username = userData.username;
        }
        if(userData.email && this.validator.email("email", userData.username).unique(() => existsByEmail).check()) {
            user.email = userData.email;
        }
        if(userData.password && this.validator.password("password", userData.password).check()) {
            user.password = this.passwordService.encodePassword(userData.password);
        }

        this.validator.throwErrors();
        return this.userRepository.save(user);
    }

    public async existsByUsername(username: string): Promise<boolean> {        
        return this.userRepository.exists({ where: {username}});
    }

    public async existsByEmail(email: string): Promise<boolean> {
        return this.userRepository.exists({ where: {email}});
    }

}
