import { EntityRepository, Repository } from "typeorm";
import { GrantCode } from "../entities/grantCode.entity";

@EntityRepository(GrantCode)
export class GrantCodeRepository extends Repository<GrantCode> {
    
}