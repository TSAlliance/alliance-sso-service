import { ApiProperty } from "@nestjs/swagger";
import { RandomUtil } from "@tsalliance/rest";
import { Account, AccountType } from "src/account/account.entity";
import { Permission } from "src/roles/permission.entity";
import { Role } from "src/roles/role.entity";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne } from "typeorm";
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

    @ApiProperty({ required: false, isArray: true, default: [] })
    allowedServices?: Service[]

    @ApiProperty({ required: false })
    role?: Role;
}

@Entity({
    
})
export class User extends Account {
    
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

    @ManyToOne(() => Role, { nullable: true, onDelete: "SET NULL", eager: true })
    @JoinColumn()
    public role: Role;

    @ManyToMany(() => Service)
    @JoinTable({ name: "user_services" })
    public allowedServices: Service[]

    constructor() {
        super(AccountType.USER, RandomUtil.randomCredentialHash());
    }

    public hasPermission(permission: string): boolean {
        if(this.role) {
            if(this.role.id == "*") return true;
            else return this.role.permissions.map((value) => value.id).includes(permission)
        }
        return false;
    }

    public censored(): User {
        const user = { ...this }
        user.accountType = undefined;
        user.password = undefined;
        user.credentialHash = undefined;
        
        return user;
    }

}