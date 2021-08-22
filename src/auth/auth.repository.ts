import { EntityRepository, Repository } from "typeorm";
import { AuthCode } from "./auth.entity";

@EntityRepository(AuthCode)
export class AuthCodeRepository extends Repository<AuthCode> {

}