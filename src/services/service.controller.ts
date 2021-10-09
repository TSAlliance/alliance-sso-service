import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Permission } from '@tsalliance/rest';
import { Pageable } from 'nestjs-pager';
import { PermissionCatalog } from 'src/permission/permission.registry';
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
    @Permission(PermissionCatalog.SERVICES_READ)
    public async findAll(@Pageable() pageable?: Pageable) {
        return this.serviceService.findAll(pageable);
    }

    @Get(":serviceId")
    @Permission(PermissionCatalog.SERVICES_READ)
    public async getService(@Param("serviceId") serviceId: string) {
        return this.serviceService.findById(serviceId)
    }

    @Post()
    @Permission(PermissionCatalog.SERVICES_WRITE)
    public createService(@Body() service: ServiceDTO) {
        return this.serviceService.create(service);
    }

    @Put(":serviceId")
    @Permission(PermissionCatalog.SERVICES_WRITE)
    public updateService(@Param('serviceId') serviceId: string, @Body() service: ServiceDTO) {
        return this.serviceService.update(serviceId, service);
    }

    @Delete(":serviceId")
    @Permission(PermissionCatalog.SERVICES_WRITE)
    public deleteService(@Param('serviceId') serviceId: string): Promise<DeleteResult> {
        return this.serviceService.delete(serviceId);
    }

    @Get("/regenerate/:serviceId")
    @Permission(PermissionCatalog.SERVICES_WRITE)
    public async regenerateCredentials(@Param('serviceId') serviceId: string): Promise<Service> {   
        return this.serviceService.regenerateCredentials(serviceId);
    }

}
