import { Injectable } from "@nestjs/common";
import { User } from "src/users/user.entity";
import { EntitySubscriberInterface, EventSubscriber, UpdateEvent } from "typeorm";

@Injectable()
@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface {

    listenTo() {
        return User;
    }

    afterUpdate(event: UpdateEvent<User>) {
        // TODO
        console.log("user updated", event.updatedColumns)
    }

}