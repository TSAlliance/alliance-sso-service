import { SSOSession } from "../session/ssoSession";

export class SSOStore {

    private session?: SSOSession;

    public getSession(): SSOSession {
        return this.session;
    }

}