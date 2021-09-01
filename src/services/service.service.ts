import { Injectable, NotFoundException } from '@nestjs/common';
import { RandomUtil, Validation, Validator } from '@tsalliance/rest';
import { Page, Pageable } from 'nestjs-pager';
import { DeleteResult, FindManyOptions } from 'typeorm';
import { Service, ServiceDTO } from './service.entity';
import { ServiceRepository } from './service.repository';

@Injectable()
export class ServiceService {

    constructor(private serviceRepository: ServiceRepository){}

    public async findAll(pageable: Pageable, options?: FindManyOptions<Service>): Promise<Page<Service>> {
        return this.serviceRepository.findAll(pageable, options);
    }

    public async findById(serviceId: string): Promise<Service> {
        return this.serviceRepository.findOneOrFail({ where: { id: serviceId } })
    }

    public async findByCredentials(clientId: string, clientSecret: string): Promise<Service> {
        return this.serviceRepository.findOneOrFail({ where: { clientId, clientSecret } })
    }

    public async createService(data: ServiceDTO, @Validation() validator?: Validator): Promise<Service> {       
        const service = new Service();

        validator.text("title", data.title).alphaNum().minLen(3).maxLen(32).required().check();
        if(data.description && validator.text("description", data.description).minLen(3).maxLen(120).check()) {
            service.description = data.description;
        }
        
        validator.throwErrors();

        service.title = data.title;
        service.isListed = data.isListed;
        return this.serviceRepository.save(service);
    }

    public async updateService(id: string, data: ServiceDTO, @Validation() validator?: Validator): Promise<Service> {
        const service: Service = await this.findById(id);        
        if(!service) throw new NotFoundException();

        if(data.title && validator.text("title", data.title).alpha().minLen(3).maxLen(32).check()) {
            service.title = data.title;
        }

        if(data.description && validator.text("description", data.description).minLen(3).maxLen(120).check()) {
            service.description = data.description;
        }

        validator.throwErrors();
        service.isListed = data.isListed;

        return this.serviceRepository.save(service);
    }

    public async regenerateCredentials(id: string): Promise<Service> {
        const service: Service = await this.findById(id);        
        if(!service) throw new NotFoundException();

        service.clientId = RandomUtil.generateClientId();
        service.clientSecret = RandomUtil.generateClientSecret();
        service.credentialHash = RandomUtil.randomCredentialHash();

        return this.serviceRepository.save(service);
    }

    

    public async deleteService(id: string): Promise<DeleteResult> {
        return this.serviceRepository.delete({ id })
    }

}
