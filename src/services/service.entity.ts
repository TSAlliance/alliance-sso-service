import { ApiProperty } from "@nestjs/swagger";
import { RandomUtil } from "@tsalliance/rest";
import { Account, AccountType } from "src/account/account.entity";
import { Permission } from "src/roles/permission.entity";
import { BeforeInsert, Column, Entity, JoinTable, ManyToMany } from "typeorm";

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

    @Column({ nullable: true, default: true })
    public isListed: boolean;
    
    @Column({ nullable: true })
    public accentColor?: string;
    
    @Column({ nullable: true })
    public bannerResourceUri: string;
    
    @Column({ nullable: true })
    public iconResourceUri: string;

    @Column({ unique: true, nullable: false })
    public clientId: string;

    @Column({ unique: true, nullable: false })
    public clientSecret: string;

    @ManyToMany(() => Permission)
    @JoinTable({ name: "service_permissions_registry" })
    public permissionCatalog: Permission[]

    constructor() {
        super(AccountType.SERVICE, RandomUtil.randomCredentialHash())
    }

    public hasPermission(permission: string): boolean {
        // First party services always have permission
        return true;
    }

    @BeforeInsert()
    public populateClientCredentials() {
        this.clientSecret = RandomUtil.generateClientSecret()
        this.clientId = RandomUtil.generateClientId();
    }
}