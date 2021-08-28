import { Injectable, NotFoundException } from '@nestjs/common';
import { Page, Pageable } from 'nestjs-pager';
import { ServiceService } from 'src/services/service.service';
import { Service } from '../services/service.entity';
import { Permission, PermissionDTO } from './permission.entity';
import { PermissionRepository } from './permission.repository';

@Injectable()
export class PermissionService {
    constructor(
        private permissionRepository: PermissionRepository,
        private serviceService: ServiceService
    ){}

    public async findAll(@Pageable() pageable: Pageable): Promise<Page<Permission>> {
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

    public async findByService(serviceId: string): Promise<Permission[]> {
        return this.permissionRepository.find({
            where: {
                service: {
                    id: serviceId
                }
            }
        })
    }

    public async registerPermissionsForService(serviceId: string, data: PermissionDTO[]): Promise<Permission[]> {
        const service: Service = await this.serviceService.findById(serviceId);
        if(!service) throw new NotFoundException(); 

        return this.permissionRepository.save(data.map((value) => {
            const p = new Permission(value.title, value.permissionValue, service);
            p.description = value.description
            return p;
        }));
    }
}
