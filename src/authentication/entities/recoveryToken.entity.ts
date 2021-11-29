import { RandomUtil } from "@tsalliance/rest";
import { User } from "src/users/user.entity";
import { BeforeInsert, Column, Entity, JoinColumn, OneToOne } from "typeorm";

@Entity()
export class AccountRecoveryToken {

    @OneToOne(() => User, { primary: true, onDelete: "CASCADE" })
    @JoinColumn()
    public user: User;

    @Column({ nullable: false, unique: true })
    public code: string;

    @Column({ nullable: false })
    public expiresAt: Date;

    @BeforeInsert()
    public populateTokenValue() {
        this.code = RandomUtil.randomString(6).toUpperCase();

        // Defaults to 10mins
        this.expiresAt = new Date((Date.now() + (1000 * 60 * 10)))
    }

    public isValid(): boolean {
        return this.expiresAt.getTime() >= Date.now();
    }

}