import { RandomUtil } from "@tsalliance/rest";

export class Authentication {

    public grantCode: string;
    public issuedAt: Date;

    constructor() {
        this.grantCode = RandomUtil.randomString(8);
        this.issuedAt = new Date();
    }

}
