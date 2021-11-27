import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CanAccess } from '@tsalliance/rest';
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
    @CanAccess([PermissionCatalog.SERVICES_READ,PermissionCatalog.SERVICES_WRITE])
    public async findAll(@Pageable() pageable?: Pageable) {
        return this.serviceService.findAll(pageable);
    }

    @Get(":serviceId")
    @CanAccess([PermissionCatalog.SERVICES_READ,PermissionCatalog.SERVICES_WRITE])
    public async getService(@Param("serviceId") serviceId: string) {
        return this.serviceService.findById(serviceId)
    }

    @Get("/byClientId/:clientId")
    public async findByClientId(@Param("clientId") clientId: string) {
        return this.serviceService.findByClientId(clientId)
    }

    @Post()
    @CanAccess(PermissionCatalog.SERVICES_WRITE)
    public createService(@Body() service: ServiceDTO) {
        return this.serviceService.create(service);
    }

    @Put(":serviceId")
    @CanAccess(PermissionCatalog.SERVICES_WRITE)
    public updateService(@Param('serviceId') serviceId: string, @Body() service: ServiceDTO) {
        return this.serviceService.update(serviceId, service);
    }

    @Delete(":serviceId")
    @CanAccess(PermissionCatalog.SERVICES_WRITE)
    public deleteService(@Param('serviceId') serviceId: string): Promise<DeleteResult> {
        return this.serviceService.delete(serviceId);
    }

    @Get("/regenerate/:serviceId")
    @CanAccess(PermissionCatalog.SERVICES_WRITE)
    public async regenerateCredentials(@Param('serviceId') serviceId: string): Promise<Service> {   
        return this.serviceService.regenerateCredentials(serviceId);
    }

}
