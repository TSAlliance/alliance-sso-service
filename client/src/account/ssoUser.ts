import { SSOServiceDTO } from "src/dto/service.dto";
import { SSORoleDTO } from "src/dto/role.dto";
import { AccountType } from "../../../src/account/account.entity";
import { SSOAccount } from "./ssoAccount";

export class SSOUser extends SSOAccount {

    public username: string;
    public email: string;
    public discordId?: string;
    public avatarResourceUri: string;
    public avatarResourceId: string;
    public role: SSORoleDTO;
    public allowedServices: SSOServiceDTO[]

    constructor() {
        super(AccountType.USER)
    }

    public hasPermission(permission: string): boolean {
        if(this.role) {
            if(this.role.id == "*") return true;
            else return this.role.permissions.includes(permission)
        }
        return false;
    }

}