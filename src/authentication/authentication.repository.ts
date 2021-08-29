import { EntityRepository, Repository } from "typeorm";
import { AccountRecoveryToken } from "./authentication.entity";

@EntityRepository(AccountRecoveryToken)
export class RecoveryTokenRepository extends Repository<AccountRecoveryToken> {
    
}