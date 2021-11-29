import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class RecoveryRequestDTO {
    @ApiProperty({ required: true })
    @IsNotEmpty()
    @IsEmail()
    public email: string;
}