import { Account, AccountType } from "src/account/account.entity";
import { Service } from "src/service/service.entity";
import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from "typeorm";

export interface UserDTO {
    username?: string;
    email?: string;
    password?: string;
}

@Entity()
export class User extends Account implements UserDTO {
    
    @Column({ length: 32, nullable: false, unique: true })
    public username: string;

    @Column({ nullable: false, unique: true })
    public email: string;

    @Column({ nullable: false })
    public password: string;

    @Column({ unique: true })
    public discordId: string;

    @Column()
    public avatarResourceUri: string;

    @ManyToMany(() => Service, { cascade: true })
    @JoinTable()
    public services: Service[]

    constructor(username: string, email: string, password: string) {
        super(AccountType.USER);
        this.username = username;
        this.email = email;
        this.password = password;
    }

    public hasPermission(permission: string): boolean {
        // TODO
        return false;
    }

    public canAccessService(serviceId: string): boolean {
        return false;
        //return (!!this.allowedServices?.find((service: Service) => service.id === serviceId))
    }

}