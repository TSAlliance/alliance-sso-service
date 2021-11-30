import { IsOptional, Min, MinDate,  } from "class-validator"

export class CreateInviteDto {

    @IsOptional()
    @MinDate(new Date(Date.now() + 1000 * 60 * 60 * 24))
    public expiresAt?: Date;
    
    @IsOptional()
    @Min(0)
    public maxUses?: number;
    
    @IsOptional()
    public assignRole?: { id: string };
    
    public inviter?: { id: string };

}
