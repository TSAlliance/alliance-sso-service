import { AccountType } from "../../../src/account/account.entity";

export abstract class SSOAccount {

    public id: string;
    public accountType: AccountType;

    constructor(accountType: AccountType) {
        this.accountType = accountType;
    }

    public abstract hasPermission(permission: string): boolean;

}