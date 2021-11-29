import { CanRead, RandomUtil } from "@tsalliance/rest";
import { AccountType } from "src/account/account.entity";
import { BeforeInsert, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class GrantCode {

    @CanRead(false)
    @PrimaryGeneratedColumn("uuid")
    public id: string;

    @CanRead(false)
    @Column({ nullable: false })
    public accountId: string

    @CanRead(false)
    @Column({ nullable: false })
    public accountType: AccountType

    @CanRead(false)
    @Column({ nullable: false })
    public clientId: string;

    @Column({ nullable: false })
    public grantCode: string;

    @CanRead(false)
    @Column({ nullable: false, default: false })
    public stayLoggedIn: boolean;

    @CreateDateColumn()
    public issuedAt: Date;

    @CanRead(false)
    @Column({ nullable: false })
    public expiresAt: Date;

    @BeforeInsert()
    public beforeInsert() {
        this.grantCode = RandomUtil.randomString(8);
        this.issuedAt = new Date();
        this.expiresAt = new Date(this.issuedAt.getTime() + 1000 * 60 * 10); // Valid for 10 minutes
    }

}