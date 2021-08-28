import { ApiProperty } from "@nestjs/swagger";
import { Account, AccountType } from "src/account/account.entity";

export class CredentialsDTO {

    @ApiProperty({
        description: "Specify whether to sign in as a user or something else, e.g. a first-party service. If signing in as service, please keep in mind that identifier is treated as clientId and password is treated as the clientSecret.",
        enum: AccountType
    })
    accountType: AccountType;

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
}

export class RequestRecoveryDTO {
    @ApiProperty({ required: true })
    email: string;
}

export class RecoveryDTO {
    @ApiProperty({ required: true })
    recoveryToken: string;

    @ApiProperty({ required: true })
    password: string;
}

export interface JwtResponseDTO {
    expiresAt?: Date;
    issuedAt?: Date;
    token: string;
    issuedTo: Account;
}

export interface JwtDTO {
    id: string;
    accountType: AccountType
    exp?: number;
}