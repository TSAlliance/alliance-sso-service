import { AccountType } from "src/account/account";

export class AccessTokenDTO {

    public accountId: string;
    public accountType: AccountType;
    public credentialHash: string;
    public exp?: number;

}