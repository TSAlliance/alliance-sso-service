import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsUrl, Length } from "class-validator";

export class CreateAuthorizationDTO {
    
    @ApiProperty({ required: true })
    @IsNotEmpty()
    @Length(8, 8)
    public grantCode: string;

    @ApiProperty({ required: true })
    @IsNotEmpty()
    @IsUrl()
    public redirectUri: string;

}