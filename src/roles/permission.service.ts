import { Injectable } from '@nestjs/common';
import { Page, Pageable } from 'nestjs-pager';
import { Service } from 'src/service/service.entity';
import { ServiceService } from 'src/service/service.service';
import { Permission } from './permission.entity';
import { PermissionRepository } from './permission.repository';

@Injectable()
export class PermissionService {
    constructor(
        private permissionRepository: PermissionRepository,
        private serviceService: ServiceService
    ){}

    public async findAll(pageable: Pageable) {
        return this.permissionRepository.findAll(pageable);
    }

    public async findPermissionsByServiceId(serviceId: string): Promise<Permission[]> {
        return this.permissionRepository.find({
            where: {
                service: {
                    id: serviceId
                }
            }
        })
    }

    public async findRelatedService(permission: string): Promise<Service> {
        return (await this.permissionRepository.findOne({ where: { permissionValue: permission }}))?.service
    }

    public async getCategorizedByServices(pageable: Pageable): Promise<Page<Service>> {
        return this.serviceService.findAll(pageable, { relations: ["permission"] })
    }
}
