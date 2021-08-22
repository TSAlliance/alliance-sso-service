import { RestRepository } from "@tsalliance/rest";
import { EntityRepository } from "typeorm";
import { Service } from "./service.entity";

@EntityRepository(Service)
export class ServiceRepository extends RestRepository<Service> {
}