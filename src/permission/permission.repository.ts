import { RestRepository } from "@tsalliance/rest";
import { EntityRepository } from "typeorm";
import { Permission } from "./permission.entity";

@EntityRepository(Permission)
export class PermissionRepository extends RestRepository<Permission> {
    
}