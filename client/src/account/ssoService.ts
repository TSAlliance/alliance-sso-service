import { SSOAccount } from "./ssoAccount";

export class SSOService extends SSOAccount {

    public title: string;
    public description?: string;
    public isListed: boolean;
    public accentColor?: string;
    public bannerResourceUri: string;
    public iconResourceUri: string;

    public hasPermission(permission: string): boolean {
        // First party services always have permission
        return true;
    }
}