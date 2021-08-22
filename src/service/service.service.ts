import { Injectable, NotFoundException } from '@nestjs/common';
import { RandomUtil, Validator } from '@tsalliance/rest';
import { Page, Pageable } from 'nestjs-pager';
import { DeleteResult, FindManyOptions } from 'typeorm';
import { Service, ServiceDTO } from './service.entity';
import { ServiceRepository } from './service.repository';

@Injectable()
export class ServiceService {

    constructor(
        private serviceRepository: ServiceRepository,
        private validator: Validator
    ){}

    public async findAll(pageable: Pageable, options?: FindManyOptions<Service>): Promise<Page<Service>> {
        return this.serviceRepository.findAll(pageable, options);
    }

    public async findById(serviceId: string): Promise<Service> {
        return this.serviceRepository.findOne({ id: serviceId })
    }

    public async createService(data: ServiceDTO): Promise<Service> {
        this.validator.text("title", data.title).alphaNum().minLen(3).maxLen(32).required().check();
        this.validator.throwErrors();

        const service = new Service(data.title);
        return this.serviceRepository.save(service);
    }

    public async updateService(id: string, data: ServiceDTO): Promise<Service> {
        const service: Service = await this.findById(id);        
        if(!service) throw new NotFoundException();

        if(this.validator.text("title", data.title).alpha().minLen(3).maxLen(32).check()) {
            if(data.title) service.title = data.title;
        }

        this.validator.throwErrors();
        return this.serviceRepository.save(service);
    }

    public async regenerateCredentials(id: string): Promise<Service> {
        const service: Service = await this.findById(id);        
        if(!service) throw new NotFoundException();

        service.clientId = RandomUtil.generateClientId();
        service.clientSecret = RandomUtil.generateClientSecret();

        return this.serviceRepository.save(service);
    }

    public async deleteService(id: string): Promise<DeleteResult> {
        return this.serviceRepository.delete({ id });
    }

}
