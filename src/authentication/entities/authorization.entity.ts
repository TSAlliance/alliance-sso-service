
export class Authorization {

    public accessToken: string;
    public expiresAt?: Date;
    public issuedAt: Date;

    constructor(accessToken: string, expiresAt?: Date) {
        this.accessToken = accessToken;
        this.expiresAt = expiresAt;
        this.issuedAt = new Date();
    }

}