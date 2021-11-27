export class CreateInviteDto {

    public expiresAt?: Date;
    public maxUses?: number;
    public assignRole?: { id: string };
    public inviter?: { id: string };

}
