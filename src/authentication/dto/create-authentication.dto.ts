import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsUrl } from "class-validator";
import { AccountType } from "src/account/account";

export class CreateAuthenticationDTO {
    
    @ApiProperty({ required: true })
    @IsNotEmpty({ message: "identifier not set." })
    public identifier: string;

    @ApiProperty({ required: true })
    @IsNotEmpty({ message: "password not set." })
    public password: string;

    @ApiProperty({ required: true })
    @IsNotEmpty({ message: "clientId not set." })
    public clientId: string;

    @ApiProperty({ required: true })
    @IsNotEmpty({ message: "redirectUri not set." })
    @IsUrl({ message: "redirectUri not a valid url." })
    public redirectUri: string;

    @ApiProperty({ required: false })
    @IsOptional({ message: "useExistingAccessToken is Optional, but invalid value exists." })
    @IsNotEmpty({ message: "useExistingAccessToken not set." })
    public useExistingAccessToken?: string;

    @ApiProperty({ default: false, required: false })
    @IsOptional({ message: "stayLoggedIn is Optional, but invalid value exists." })
    @IsBoolean({ message: "stayLoggedIn not a boolean." })
    public stayLoggedIn?: boolean;

    @ApiProperty({ default: false, required: false })
    @IsOptional({ message: "accountType is Optional, but invalid value exists." })
    @IsEnum({ message: "accountType not a boolean." })
    public accountType: AccountType;

}