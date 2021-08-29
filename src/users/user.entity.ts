import { ApiProperty } from "@nestjs/swagger";
import { RandomUtil } from "@tsalliance/rest";
import { Account, AccountType } from "src/account/account.entity";
import { Column, Entity, JoinTable, ManyToMany } from "typeorm";
import { Service } from "../services/service.entity";

export class UserDTO {
    @ApiProperty({ required: true })
    username: string;

    @ApiProperty({ required: true })
    email: string;

    @ApiProperty({ required: true })
    password: string;

    @ApiProperty({ required: false })
    discordId?: string;
}

@Entity()
export class User extends Account implements UserDTO {
    
    @Column({ length: 32, nullable: false, unique: true })
    public username: string;

    @Column({ nullable: false, unique: true })
    public email: string;

    @Column({ nullable: false })
    public password: string;

    @Column({ unique: true, nullable: true })
    public discordId?: string;

    @Column({ nullable: true })
    public avatarResourceUri: string;

    @Column({ nullable: true })
    public avatarResourceId: string;

    @ManyToMany(() => Service, { cascade: true })
    @JoinTable()
    public services: Service[]

    constructor(username: string, email: string, password: string) {
        super(AccountType.USER, RandomUtil.randomCredentialHash());
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