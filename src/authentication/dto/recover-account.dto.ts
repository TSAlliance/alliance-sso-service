import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class RecoverAccountDTO {

    @ApiProperty({ required: true })
    @IsNotEmpty()
    public token: string;

    @ApiProperty({ required: true })
    @IsNotEmpty()
    public password: string;

}