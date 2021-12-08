import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Authentication, CanAccess, RestAccount } from '@tsalliance/rest';
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
    // @CanAccess([PermissionCatalog.SERVICES_READ,PermissionCatalog.SERVICES_WRITE])
    public async findAll(@Authentication() authentication: RestAccount, @Pageable() pageable?: Pageable) {
        if(!authentication || !authentication.hasPermission(PermissionCatalog.SERVICES_WRITE.value) && !authentication.hasPermission(PermissionCatalog.SERVICES_READ.value)) {
            return this.serviceService.findAllListed(pageable)
        }

        return this.serviceService.findAll(pageable);
    }

    @Get(":serviceId")
    public async findService(@Param("serviceId") serviceId: string, @Authentication() authentication: RestAccount) {
        if(serviceId == "root") {
            return this.serviceService.findRootService();
        }

        if(!authentication || !authentication.hasPermission(PermissionCatalog.SERVICES_WRITE.value) && !authentication.hasPermission(PermissionCatalog.SERVICES_READ.value)) {
            return this.serviceService.findListedById(serviceId)
        }
        
        return this.serviceService.findByIdIncludingRelations(serviceId)
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
