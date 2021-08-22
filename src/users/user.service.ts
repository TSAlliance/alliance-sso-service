import { Injectable, NotFoundException } from '@nestjs/common';
import { Validator } from '@tsalliance/rest';
import { User, UserDTO } from './user.entity';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
    constructor(private userRepository: UserRepository, private validator: Validator){}

    public async findById(userId: string, withSensitive = false): Promise<User> {
        const attributes: (keyof User)[] = [ "id", "email", "username" ];
        if(withSensitive) attributes.push("password");

        return this.userRepository.findOne(userId, { select: attributes });
    }

    public async findByEmailOrUsername(email: string, username: string, withSensitive = false): Promise<User> {
        const attributes: (keyof User)[] = [ "id", "email", "username" ];
        if(withSensitive) attributes.push("password");

        return this.userRepository.createQueryBuilder().where(`username = :username OR email = :email`, { username, email }).getOne();
    }

    public async createUser(userData: UserDTO): Promise<User> {
        const existsByUsername = await this.existsByUsername(userData.username);
        const existsByEmail = await this.existsByEmail(userData.email);

        this.validator.text("username", userData.username).alphaNum().minLen(3).maxLen(32).required().unique(() => existsByUsername).check();
        this.validator.text("email", userData.username).alphaNum().minLen(3).maxLen(32).required().unique(() => existsByEmail).check();
        this.validator.password("password", userData.password).required();
        this.validator.throwErrors();

        const result = await this.userRepository.save(new User(userData.username, userData.email, userData.password));
        delete result.password;
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
        if(userData.email && this.validator.text("email", userData.username).alphaNum().minLen(3).maxLen(32).unique(() => existsByEmail).check()) {
            user.email = userData.email;
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
