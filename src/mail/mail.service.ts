import { Injectable } from "@nestjs/common"
import { MailerService } from '@nestjs-modules/mailer';
import { AccountRecoveryToken } from "src/authentication/authentication.entity";
import { readFileSync } from "fs";
import path from "path";
import mime from "mime"

export interface RecoveryMailDTO {
    token: AccountRecoveryToken;
}

@Injectable()
export class MailService {
    constructor(private mailerService: MailerService) {}

    public async sendRecoveryMail(data: RecoveryMailDTO) {    
        await this.mailerService.sendMail({
            to: data.token.user.email,
            // from: '"Support Team" <support@example.com>', // override default from
            subject: 'Informationen zu deiner Kontowiederherstellung',
            template: './recovery.template.hbs',
            context: {
                username: data.token.user.username,
                code: data.token.code,
                logoImageData: this.assetUrlToBase64("ts_logo.png"),
                bannerImageData: this.assetUrlToBase64("access_account_undraw.png")
            },
        });
    }

    private assetUrlToBase64(filename: string): string {
        const filePath = path.resolve(__dirname, "templates/assets/" + filename);
        const base64Data = "data:" + mime.lookup(filePath) + ";base64," + readFileSync(filePath).toString("base64");
        return base64Data
    }
}