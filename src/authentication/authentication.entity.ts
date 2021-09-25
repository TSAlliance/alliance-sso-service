import { ApiProperty } from "@nestjs/swagger";
import { RandomUtil } from "@tsalliance/rest";
import { AccountType } from "src/account/account.entity";
import { User } from "src/users/user.entity";
import { BeforeInsert, Column, Entity, JoinColumn, OneToOne } from "typeorm";

export class CredentialsDTO {

    @ApiProperty({
        description: "Specify whether to sign in as a user or something else, e.g. a first-party service. If signing in as service, please keep in mind that identifier is treated as clientId and password is treated as the clientSecret.",
        enum: AccountType,
        default: AccountType.USER,
        required: false
    })
    accountType: AccountType = AccountType.USER;

    @ApiProperty({
        description: "Either an username or an email should be present to login as a user. The treatment of the inserted value depends on the accountType described above."
    })
    identifier: string;

    @ApiProperty({
        description: "Password to sign the user or service in. The treatment of the inserted value depends on the accountType described above."
    })
    password: string;

    @ApiProperty({
        description: "If true, the session token won't have an expiry date.",
        default: false,
        required: false
    })
    stayLoggedIn?: boolean;
}

export class RegistrationDTO {

    @ApiProperty({ required: true })
    email: string;

    @ApiProperty({ required: true })
    username: string;

    @ApiProperty({ required: true })
    password: string;

    @ApiProperty({ required: false })
    discordId?: string;

    @ApiProperty({ required: true })
    inviteCode: string;
}

export class RequestRecoveryDTO {
    @ApiProperty({ required: true })
    email: string;
}

export class RecoveryDTO {
    @ApiProperty({ required: true })
    token: string;

    @ApiProperty({ required: true })
    password: string;
}

export class ChangePasswordDTO {
    @ApiProperty({ required: true })
    currentPassword: string;

    @ApiProperty({ required: true })
    newPassword: string;
}

@Entity({ name: "account_recovery" })
export class AccountRecoveryToken {

    @OneToOne(() => User, { primary: true, onDelete: "CASCADE" })
    @JoinColumn()
    public user: User;

    @Column({ nullable: false, unique: true })
    public code: string;

    @Column({ nullable: false })
    public expiresAt: Date;

    constructor(user: User) {
        this.user = user;
    }

    @BeforeInsert()
    public populateTokenValue() {
        this.code = RandomUtil.randomString(6).toUpperCase();

        // Defaults to 10mins in the future
        this.expiresAt = new Date((Date.now() + (1000 * 60 * 10)))
    }

    public isValid(): boolean {
        return this.expiresAt.getTime() >= Date.now();
    }

}

export interface JwtResponseDTO {
    expiresAt?: Date;
    issuedAt: Date;
    token: string;
}

export interface JwtDTO {
    id: string;
    accountType: AccountType;
    credentialHash: string;
    exp?: number;
}