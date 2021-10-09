import { ApiProperty } from "@nestjs/swagger";
import { CanRead, CanReadPermission, RandomUtil } from "@tsalliance/rest";
import { Account, AccountType } from "src/account/account.entity";
import { PermissionCatalog } from "src/permission/permission.registry";
import { Role, RoleDTO } from "src/roles/role.entity";
import { BeforeInsert, Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne } from "typeorm";
import { Service, ServiceDTO } from "../services/service.entity";

export class UserDTO {
    @ApiProperty({ required: true })
    username: string;

    @ApiProperty({ required: true })
    email: string;

    @ApiProperty({ required: true })
    password: string;

    @ApiProperty({ required: false })
    discordId?: string;

    @ApiProperty({ required: false, isArray: true, default: [], type: () => ServiceDTO })
    allowedServices?: Service[]

    @ApiProperty({ required: false, type: () => RoleDTO })
    role?: Role;
}

@Entity({
    
})
export class User extends Account {
    
    @Column({ length: 32, nullable: false, unique: true })
    public username: string;

    @CanReadPermission(PermissionCatalog.USERS_READ)
    @Column({ nullable: false, unique: true })
    public email: string;

    @CanRead(false)
    @Column({ nullable: false })
    public password: string;

    @CanReadPermission(PermissionCatalog.USERS_READ)
    @Column({ unique: true, nullable: true })
    public discordId?: string;

    @Column({ nullable: true })
    public avatarResourceId: string;

    @CanReadPermission(PermissionCatalog.USERS_READ)
    @ManyToOne(() => Role, { nullable: true, onDelete: "SET NULL", eager: true })
    @JoinColumn()
    public role: Role;

    @CanReadPermission(PermissionCatalog.USERS_READ)
    @ManyToMany(() => Service)
    @JoinTable({ name: "user_services" })
    public allowedServices: Service[]

    public hasPermission(permission: string): boolean {
        if(this.role) {
            if(this.role.id == "*") return true;
            else return this.role.permissions.map((value) => value.id).includes(permission)
        }
        return false;
    }

    @BeforeInsert()
    public insertHook() {
        this.accountType = AccountType.USER;
        this.credentialHash = RandomUtil.randomCredentialHash()
    }

    public censored(): User {
        const user = { ...this }
        user.accountType = undefined;
        user.password = undefined;
        user.credentialHash = undefined;
        
        return user;
    }

}