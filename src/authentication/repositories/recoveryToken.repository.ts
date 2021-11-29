import { EntityRepository, Repository } from "typeorm";
import { AccountRecoveryToken } from "../entities/recoveryToken.entity";

@EntityRepository(AccountRecoveryToken)
export class RecoveryTokenRepository extends Repository<AccountRecoveryToken> {
    
}