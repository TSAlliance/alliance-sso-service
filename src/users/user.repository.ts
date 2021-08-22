import { EntityRepository } from "typeorm";
import { RestRepository } from "@tsalliance/rest"
import { User } from "./user.entity";

@EntityRepository(User)
export class UserRepository extends RestRepository<User> {
    
}