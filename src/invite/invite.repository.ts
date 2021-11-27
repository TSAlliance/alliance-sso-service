import { RestRepository } from "@tsalliance/rest";
import { EntityRepository } from "typeorm";
import { Invite } from "./entities/invite.entity";

@EntityRepository(Invite)
export class InviteRepository extends RestRepository<Invite> {
    
}