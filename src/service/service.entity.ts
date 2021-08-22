import { ApiProperty } from "@nestjs/swagger";
import { RandomUtil } from "@tsalliance/rest";
import { Account, AccountType } from "src/account/account.entity";
import { BeforeInsert, Column, Entity } from "typeorm";

export class ServiceDTO {
    @ApiProperty()
    title: string;
}

@Entity()
export class Service extends Account implements ServiceDTO {

    @Column({ length: 32 })
    public title: string;
    
    @Column()
    public backgroundResourceUri: string;
    
    @Column()
    public bannerResourceUri: string;
    
    @Column()
    public iconResourceUri: string;

    @Column({ unique: true, nullable: false })
    public clientId: string;

    @Column({ unique: true, nullable: false })
    public clientSecret: string;

    @Column({ unique: true, nullable: false, update: false })
    public readonly identifier: string;

    constructor(title: string) {
        super(AccountType.SERVICE)
        this.title = title;
        this.identifier = title?.replaceAll(" ", "-").toLowerCase()
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