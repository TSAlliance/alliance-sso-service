import { RestRepository } from "@tsalliance/rest";
import { EntityRepository } from "typeorm";
import { Role } from "./role.entity";

@EntityRepository(Role)
export class RoleRepository extends RestRepository<Role> {
    
}