import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';

@Global()
@Module({
    providers: [ MailService ],
    exports: [ MailService ]
})
export class MailModule {
    constructor() {
        console.log(process.env.SMTP_HOST)
    }
}
