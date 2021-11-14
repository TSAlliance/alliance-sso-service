import { Injectable } from "@nestjs/common"
import { MailerService } from '@nestjs-modules/mailer';
import { AccountRecoveryToken } from "src/authentication/authentication.entity";
import { existsSync, readFileSync } from "fs";
import path from "path";
import mime from "mime"

export interface RecoveryMailDTO {
    token: AccountRecoveryToken;
}

@Injectable()
export class MailService {
    constructor(private mailerService: MailerService) {}

    public async sendRecoveryMail(data: RecoveryMailDTO) {   
        // TODO: Implement asset service (microservice) 
        await this.mailerService.sendMail({
            to: data.token.user.email,
            subject: 'Informationen zu deiner Kontowiederherstellung',
            template: this.templatePath("recovery.template.hbs"),
            context: {
                username: data.token.user.username,
                code: data.token.code,
            },
        });
    }

    private getBaseDir(): string {
        return path.resolve((process.env.NODE_ENV == "production" ? process.cwd() : process.cwd() + "/dist"));
    }

    private templatePath(filename: string): string {
        const paths = [
            path.resolve(__dirname, "templates/" + filename),
            path.resolve(this.getBaseDir(), "mail/templates/" + filename)
        ]

        return paths.find((path) => existsSync(path));
    }

    private assetUrlToBase64(filename: string): string {
        const paths = [
            path.resolve(__dirname, "templates/" + filename),
            path.resolve(this.getBaseDir(), "mail/templates/" + filename)
        ]

        let base64Data = "";
        for(const path of paths) {
            if(existsSync(paths[0])) {
                base64Data = "data:" + mime.lookup(path) + ";base64," + readFileSync(path).toString("base64")
                break;
            }
        }

        return base64Data
    }
}