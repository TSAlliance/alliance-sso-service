import { RestRepository } from "@tsalliance/rest";
import { EntityRepository } from "typeorm";
import { AccountRecoveryToken } from "./authentication.entity";

@EntityRepository(AccountRecoveryToken)
export class RecoveryTokenRepository extends RestRepository<AccountRecoveryToken> {
    
}