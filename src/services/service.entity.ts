import { ApiProperty } from "@nestjs/swagger";
import { CanRead, CanReadPermission, RandomUtil } from "@tsalliance/rest";
import { Account, AccountType } from "src/account/account.entity";
import { Permission } from "src/permission/permission.entity";
import { PermissionCatalog } from "src/permission/permission.registry";
import { BeforeInsert, Column, Entity, OneToMany } from "typeorm";

export class ServiceDTO {
    @ApiProperty()
    title: string;

    @ApiProperty({ required: false, default: true })
    isListed: boolean;

    @ApiProperty({ required: false })
    description?: string;

    @ApiProperty({ required: false })
    accentColor?: string
}

@Entity()
export class Service extends Account implements ServiceDTO {

    @Column({ length: 32 })
    public title: string;

    @Column({ length: 120, nullable: true })
    public description?: string;

    @CanReadPermission(PermissionCatalog.SERVICES_READ)
    @Column({ nullable: true, default: true })
    public isListed: boolean;
    
    @Column({ nullable: true })
    public accentColor?: string;
    
    @Column({ nullable: true })
    public bannerResourceUri: string;
    
    @Column({ nullable: true })
    public iconResourceUri: string;

    @CanRead(false)
    @Column({ unique: true, nullable: false })
    public clientId: string;

    @CanRead(false)
    @Column({ unique: true, nullable: false })
    public clientSecret: string;

    @CanReadPermission(PermissionCatalog.SERVICES_READ)
    @OneToMany(() => Permission, permission => permission.service)
    public permissions: Permission[]

    public hasPermission(permission: string): boolean {
        // First party services always have permission
        return true;
    }

    @BeforeInsert()
    public populateClientCredentials() {
        this.accountType = AccountType.SERVICE;
        this.credentialHash = RandomUtil.randomCredentialHash();
        this.clientSecret = RandomUtil.generateClientSecret()
        this.clientId = RandomUtil.generateClientId();
    }
}