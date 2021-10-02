import { AccountType } from "../../../src/account/account.entity";

export enum SSOAccountType {
    USER = "account_user",
    SERVICE = "account_service"
}

export abstract class SSOAccount {

    public id: string;
    public accountType: AccountType;

    constructor(accountType: AccountType) {
        this.accountType = accountType;
    }

    public abstract hasPermission(permission: string): boolean;

}