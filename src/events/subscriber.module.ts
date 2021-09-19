import { Global, Module } from "@nestjs/common";
import { UserSubscriber } from "./user.subscriber";

@Global()
@Module({
    providers: [ UserSubscriber ],
    exports: [ UserSubscriber ]
})
export class SubscriberModule {}