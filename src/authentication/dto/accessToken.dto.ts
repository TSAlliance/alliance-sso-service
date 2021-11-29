import { AccountType } from "src/account/account.entity";

export class AccessTokenDTO {

    public accountId: string;
    public accountType: AccountType;
    public credentialHash: string;
    public exp?: number;

}