import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Pageable } from 'nestjs-pager';
import { Permission } from 'src/roles/permission.entity';
import { DeleteResult } from 'typeorm';
import { Service, ServiceDTO } from './service.entity';
import { ServiceService } from './service.service';

@Controller('services')
@ApiTags("Service Controller")
export class ServiceController {

    constructor(
        private serviceService: ServiceService
    ){}

    @Get()
    public async findAll(@Pageable() pageable?: Pageable) {
        return this.serviceService.findAll(pageable);
    }

    @Get(":serviceId")
    public async getService(@Param("serviceId") serviceId: string) {
        return this.serviceService.findById(serviceId)
    }

    @Post()
    public createService(@Body() service: ServiceDTO) {
        return this.serviceService.createService(service);
    }

    @Put(":serviceId")
    public updateService(@Param('serviceId') serviceId: string, @Body() service: ServiceDTO) {
        return this.serviceService.updateService(serviceId, service);
    }

    @Delete(":serviceId")
    public deleteService(@Param('serviceId') serviceId: string): Promise<DeleteResult> {
        return this.serviceService.deleteService(serviceId);
    }

    @Get("/regenerate/:serviceId")
    public async regenerateCredentials(@Param('serviceId') serviceId: string): Promise<Service> {   
        return this.serviceService.regenerateCredentials(serviceId);
    }

}
