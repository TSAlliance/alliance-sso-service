import { RestRepository } from "@tsalliance/rest";
import { EntityRepository } from "typeorm";
import { Invite } from "./invite.entity";

@EntityRepository(Invite)
export class InviteRepository extends RestRepository<Invite> {
    
}