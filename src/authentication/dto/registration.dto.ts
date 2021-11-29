import { ApiProperty } from "@nestjs/swagger";
import { IsAlphanumeric, IsEmail, IsNotEmpty, MaxLength, MinLength } from "class-validator";

export class RegistrationDTO {

    @ApiProperty({ required: true })
    @IsEmail()
    @IsNotEmpty()
    public email: string;

    @ApiProperty({ required: true })
    @MaxLength(32)
    @MinLength(3)
    @IsNotEmpty()
    @IsAlphanumeric()
    public username: string;

    @ApiProperty({ required: true })
    @IsNotEmpty()
    public password: string;

    @ApiProperty({ required: true })
    @IsNotEmpty()
    @IsAlphanumeric()
    @MaxLength(6)
    @MinLength(6)
    public inviteCode: string;
}