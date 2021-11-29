import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsOptional, IsUrl, Matches } from "class-validator";
import { AccountType } from "src/account/account.entity";

export class CreateAuthenticationDTO {
    
    @ApiProperty({ required: true })
    @IsNotEmpty()
    public identifier: string;

    @ApiProperty({ required: true })
    @IsNotEmpty()
    public password: string;

    @ApiProperty({ required: true })
    @IsNotEmpty()
    public clientId: string;

    @ApiProperty({ required: true })
    @IsNotEmpty()
    @IsUrl()
    public redirectUri: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNotEmpty()
    public useExistingAccessToken?: string;

    @ApiProperty({ default: false, required: false })
    @IsOptional()
    @IsBoolean()
    public stayLoggedIn?: boolean;

}