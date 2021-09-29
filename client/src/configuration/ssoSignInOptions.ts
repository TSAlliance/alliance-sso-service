import { AccountType } from "src/account/account.entity";

export interface SSOSignInOptions {
    accountType?: AccountType;
    stayLoggedIn?: boolean;
}