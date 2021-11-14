import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InsufficientPermissionException, RandomUtil, RestService, Validator } from '@tsalliance/rest';
import { Page, Pageable } from 'nestjs-pager';
import { Account } from 'src/account/account.entity';
import { PasswordService } from 'src/authentication/password.service';
import { DeleteResult, FindManyOptions } from 'typeorm';
import { MediaService } from '../media/media.service';
import { User, UserDTO } from './user.entity';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService extends RestService<User, UserDTO, UserRepository> {

    constructor(
        @Inject(forwardRef(() => MediaService)) private mediaService: MediaService,
        private passwordService: PasswordService,
        private userRepository: UserRepository
    ){
        super(userRepository);
    }

    public async findAll(pageable: Pageable, options?: FindManyOptions<User>): Promise<Page<User>> {
        const result = await this.userRepository.findAll(pageable, options);
        result?.elements.forEach((value) => value = value.censored())
        return result;
    }

    public async findById(userId: string): Promise<User> {
        const result = await this.userRepository.findOne({ where: { id: userId }, relations: ["role", "role.permissions"]});
        return Object.assign(new User(), result);
    }

    public async findByIdOrFail(userId: string, withSensitive = false): Promise<User> {
        const result = await this.userRepository.findOneOrFail({ where: { id: userId }, relations: ["role", "role.permissions"]});
        if(!withSensitive) {
            return result?.censored();
        }
        
        return Object.assign(new User(), result);
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

    public async create(data: UserDTO): Promise<User> {
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
        user.role = data.role
        const result = (await this.userRepository.save(user)).censored();

        try {
            const avatarSvgData = this.mediaService.generateAvatar(data.username + Date.now());
            const avatarResourceInfo = await this.mediaService.setUserAvatar(result.id, avatarSvgData);
    
            result.avatarResourceId = avatarResourceInfo.resourceId;
        } catch (err) {
            // Do nothing -> Silently fail
            console.log(err);
        }

        return result;
    }

    public async update(id: string, data: UserDTO, account?: Account): Promise<User> {
        const user: User = await this.findById(id);
        if(!user) throw new NotFoundException();

        if(account && account.getHierarchy() < user.getHierarchy()) {
            throw new InsufficientPermissionException()
        }

        const validator = new Validator();
        const existsByUsername = await this.existsByUsername(data.username);
        const existsByEmail = await this.existsByEmail(data.email);

        if(validator.text("username", data.username).alphaNum().minLen(3).maxLen(32).unique(() => existsByUsername).check()) {
            user.username = data.username;
        }
        if(validator.email("email", data.username).unique(() => existsByEmail).check()) {
            user.email = data.email;
        }
        if(data.password && validator.password("password", data.password).check()) {
            user.password = this.passwordService.encodePassword(data.password);
            user.credentialHash = RandomUtil.randomCredentialHash()
        }

        if(data.role) user.role = data.role
        if(data.discordId) user.discordId = data.discordId;

        validator.throwErrors();
        return this.userRepository.save(user);
    }

    public async delete(id: string, account?: Account): Promise<DeleteResult> {
        return this.userRepository.manager.transaction(async () => {
            const user = await this.findById(id);

            if(account && account.getHierarchy() < user.getHierarchy()) {
                throw new InsufficientPermissionException()
            }
            
            const result = await this.userRepository.delete(user);

            this.mediaService.deleteAvatar(user.avatarResourceId)
            return result;
        })
    }

    public getRepository(): UserRepository {
        return this.userRepository;
    }

    public async save(user: User): Promise<User> {
        return this.userRepository.save(user);
    }

    public async existsByUsername(username: string): Promise<boolean> {        
        return this.userRepository.exists({ username });
    }

    public async existsByEmail(email: string): Promise<boolean> {
        return this.userRepository.exists({ email });
    }

}
