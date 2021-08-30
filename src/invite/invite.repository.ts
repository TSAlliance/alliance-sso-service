import { PageableRepository } from "nestjs-pager";
import { EntityRepository } from "typeorm";
import { Invite } from "./invite.entity";

@EntityRepository(Invite)
export class InviteRepository extends PageableRepository<Invite> {
    
}