import { ApiProperty } from "@nestjs/swagger";
import { NotMatch } from "src/validators/notMatch.validator";

export class UpdatePasswordDTO {
    @ApiProperty({ required: true })
    public currentPassword: string;

    @ApiProperty({ required: true })
    @NotMatch(UpdatePasswordDTO, (u) => u.currentPassword)
    public newPassword: string;
}