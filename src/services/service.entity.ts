import { ApiProperty } from "@nestjs/swagger";
import { CanRead, RandomUtil, RestAccount } from "@tsalliance/rest";
import { AccountType } from "src/account/account";
import { Permission } from "src/permission/permission.entity";
import { PermissionCatalog } from "src/permission/permission.registry";
import { BeforeInsert, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ServiceRedirectUri } from "./redirect.entity";

export class ServiceDTO {
    @ApiProperty()
    title: string;

    @ApiProperty({ required: false, default: true })
    isListed: boolean;

    @ApiProperty({ required: false })
    description?: string;

    @ApiProperty({ required: false })
    accentColor?: string

    @ApiProperty({ required: false, default: [], isArray: true, type: () => ServiceRedirectUri })
    redirectUris?: ServiceRedirectUri[];
}

@Entity()
export class Service implements ServiceDTO, RestAccount {

    @PrimaryGeneratedColumn("uuid")
    public id: string;

    @CanRead(false)
    @Column({ default: AccountType.USER })
    public accountType: AccountType;

    @CreateDateColumn()
    public createdAt: Date;

    @CanRead(false)
    @Column({ nullable: false })
    public credentialHash: string;

    @Column({ length: 32 })
    public title: string;

    @Column({ length: 120, nullable: true })
    public description?: string;

    @CanRead([PermissionCatalog.SERVICES_READ,PermissionCatalog.SERVICES_WRITE])
    @Column({ nullable: true, default: true })
    public isListed: boolean;
    
    @Column({ nullable: true, default: "#AA5151" })
    public accentColor?: string;
    
    @Column({ nullable: true })
    public bannerResourceUri: string;
    
    @Column({ nullable: true })
    public iconResourceUri: string;

    @Column({ unique: true, nullable: false })
    public clientId: string;

    @CanRead([PermissionCatalog.SERVICES_READ,PermissionCatalog.SERVICES_WRITE])
    @Column({ unique: true, nullable: false })
    public clientSecret: string;

    @CanRead([PermissionCatalog.SERVICES_READ,PermissionCatalog.SERVICES_WRITE])
    @OneToMany(() => ServiceRedirectUri, uri => uri.service, { cascade: true })
    public redirectUris: ServiceRedirectUri[];

    @CanRead([PermissionCatalog.SERVICES_READ,PermissionCatalog.SERVICES_WRITE])
    @OneToMany(() => Permission, permission => permission.service)
    public permissions: Permission[]

    public hasPermission(permission: string): boolean {
        // First party services always have permission
        return true;
    }

    public getHierarchy(): number {
        return 999;
    }

    @BeforeInsert()
    public populateClientCredentials() {
        this.accountType = AccountType.SERVICE;
        this.credentialHash = RandomUtil.randomCredentialHash();
        this.clientSecret = RandomUtil.generateClientSecret()
        this.clientId = RandomUtil.generateClientId();
    }
}