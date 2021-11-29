import { Injectable, NotFoundException } from '@nestjs/common';
import { InsufficientPermissionException, RandomUtil, RestService, Validator } from '@tsalliance/rest';
import { Page, Pageable } from 'nestjs-pager';
import { DeleteResult, FindManyOptions } from 'typeorm';
import { ServiceRedirectUri } from './redirect.entity';
import { Service, ServiceDTO } from './service.entity';
import { ServiceRepository } from './service.repository';

const ROOT_SERVICE_ID = "*";

@Injectable()
export class ServiceService extends RestService<Service, ServiceDTO, ServiceRepository> {

    constructor(private serviceRepository: ServiceRepository){
        super(serviceRepository)
    }

    public async createRootService() {
        const service = new Service();
        service.id = ROOT_SERVICE_ID;
        service.isListed = false;
        service.title = "TSAlliance SSO";
        service.description = "Authentication management service";

        await this.serviceRepository.manager.createQueryBuilder()
            .insert()
            .into(Service)
            .values(service)
            .orIgnore(`("id") DO UPDATE SET "title" = :title, "isListed" = :isListed, "description" = :description`)
            .execute();
    }

    public async findAll(pageable: Pageable, options?: FindManyOptions<Service>): Promise<Page<Service>> {
        return this.serviceRepository.findAll(pageable, options);
    }

    public async findAllListed(pageable: Pageable): Promise<Page<Service>> {
        return this.serviceRepository.findAll(pageable, { where: { isListed: true }});
    }

    public async findListedById(serviceId: string): Promise<Service> {
        return this.serviceRepository.findOne({ where: { id: serviceId, isListed: true }})
    }

    public async findById(serviceId: string): Promise<Service> {
        return this.serviceRepository.findOne({ where: { id: serviceId }})
    }

    public async findByIdIncludingRelations(id: string): Promise<Service> {
        return this.serviceRepository.findOne({ where: { id }, relations: ["redirectUris", "permissions"]})
    }

    public async findByClientIdIncludingRelations(clientId: string): Promise<Service> {
        return this.serviceRepository.findOne({ where: { clientId }, relations: ["redirectUris", "permissions"]})
    }

    public async findByClientId(clientId: string): Promise<Service> {
        return this.serviceRepository.findOne({ where: { clientId } })
    }

    public async findByIdOrFail(serviceId: string): Promise<Service> {
        return this.serviceRepository.findOneOrFail({ where: { id: serviceId } })
    }

    public async findByCredentials(clientId: string, clientSecret: string): Promise<Service> {
        return this.serviceRepository.findOneOrFail({ where: { clientId, clientSecret } })
    }

    public async findRootService(): Promise<Service> {
        return this.findById(ROOT_SERVICE_ID)
    }

    public async create(data: ServiceDTO): Promise<Service> {    
        const validator = new Validator();   
        const service = new Service();

        validator.text("title", data.title).minLen(3).maxLen(32).required().check();
        if(validator.text("description", data.description).minLen(3).maxLen(120).check()) {
            service.description = data.description;
        }
        if(validator.hexColor("accentColor", data.accentColor).check()) {
            service.accentColor = data.accentColor
        }

        const uris: ServiceRedirectUri[] = data.redirectUris?.filter((uriData) => validator.url("redirectUris", uriData.uri).check());
        validator.throwErrors();

        service.title = data.title;
        service.isListed = data.isListed;
        service.redirectUris = uris;
        return this.serviceRepository.save(service);
    }

    public async update(id: string, data: ServiceDTO): Promise<Service> {
        const validator = new Validator();
        const service: Service = await this.findById(id);        
        if(!service) throw new NotFoundException();

        if(validator.text("title", data.title).minLen(3).maxLen(32).check()) {
            service.title = data.title;
        }
        if(validator.text("description", data.description).minLen(3).maxLen(120).check()) {
            service.description = data.description;
        }
        if(validator.hexColor("accentColor", data.accentColor).check()) {
            service.accentColor = data.accentColor
        }

        const uris: ServiceRedirectUri[] = data.redirectUris?.filter((uriData) => validator.url("redirectUris", uriData.uri).check());

        validator.throwErrors();
        service.isListed = data.isListed;
        // TODO: service.redirectUris = uris;
        return this.serviceRepository.save(service);
    }

    public async delete(id: string): Promise<DeleteResult> {
        if(id == ROOT_SERVICE_ID) throw new InsufficientPermissionException();
        return this.serviceRepository.delete({ id })
    }

    public async regenerateCredentials(id: string): Promise<Service> {
        const service: Service = await this.findById(id);        
        if(!service) throw new NotFoundException();

        service.clientId = RandomUtil.generateClientId();
        service.clientSecret = RandomUtil.generateClientSecret();
        service.credentialHash = RandomUtil.randomCredentialHash();

        return this.serviceRepository.save(service);
    }

    public async hasRedirectUri(serviceClientId: string, redirectUri: string): Promise<boolean> {
        if((await this.findRootService()).clientId == serviceClientId) return true;
        return !!(await this.findByIdIncludingRelations(serviceClientId)).redirectUris.find((uri) => uri.uri == redirectUri)
    }

}
