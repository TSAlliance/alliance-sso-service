import { randomBytes } from "crypto";
import { Account } from "src/account/account.entity";
import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class AuthCode {

    @PrimaryGeneratedColumn("uuid")
    public id: string;

    @Column({ nullable: false })
    public code: string;

    /*@OneToOne(() => Account, { nullable: false, onDelete: "SET NULL" })
    public account: Account;*/

    /*constructor(account: Account) {
        this.account = account;
    }*/

    @BeforeInsert()
    public populateAuthCodeHash() {
        this.code = randomBytes(16).toString("hex");
    }

}