import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { Page, Pageable } from 'nestjs-pager';
import { ServiceService } from 'src/services/service.service';
import { Service } from '../services/service.entity';
import { Permission, PermissionDTO } from './permission.entity';
import { PermissionRepository } from './permission.repository';

@Injectable()
export class PermissionService implements OnModuleInit {
    constructor(
        private permissionRepository: PermissionRepository,
        private serviceService: ServiceService
    ){}

    public async onModuleInit(): Promise<void> {
        // TODO
    }

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

    public async findAllCategorizedByService(pageable: Pageable): Promise<Page<Service>> {
        return this.serviceService.findAll(pageable, { relations: ["permissionCatalog"] })
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

    public async findByValue(value: string): Promise<Permission> {
        return this.permissionRepository.findOne({ where: { id: value }})
    }

    public async registerPermissionsForService(serviceId: string, data: PermissionDTO[]): Promise<Permission[]> {
        const service: Service = await this.serviceService.findById(serviceId);
        if(!service) throw new NotFoundException(); 

        return this.permissionRepository.save(data.map((value) => {
            const p = new Permission(value.id, value.title);
            return p;
        }));
    }

    public async findRootPermission(): Promise<Permission> {
        return this.findByValue(Permission.formatPermission("*"))
    }

    public async findOrCreateRootPermission(): Promise<Permission> {
        const permission = await this.findRootPermission();
        if(!permission) {
            return this.permissionRepository.save(new Permission("*", "Administrator"))
        }

        return permission;
    }
}
