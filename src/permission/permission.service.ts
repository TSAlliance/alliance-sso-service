import { Injectable, NotFoundException } from '@nestjs/common';
import { Page, Pageable } from 'nestjs-pager';
import { ServiceService } from 'src/services/service.service';
import { Service } from '../services/service.entity';
import { Permission, PermissionDTO } from './permission.entity';
import { PermissionCatalog } from './permission.registry';
import { PermissionRepository } from './permission.repository';

@Injectable()
export class PermissionService {
    constructor(
        private permissionRepository: PermissionRepository,
        private serviceService: ServiceService
    ){}

    public async createDefaultPermissions() {
        const service = await this.serviceService.findRootService();
        const permissions = Object.values(PermissionCatalog).map((val) => {
            const p = new Permission(val.value, val.title, service)
            return p;
        });

        await this.permissionRepository.manager.createQueryBuilder()
            .insert()
            .into(Permission)
            .values(permissions)
            .orIgnore(`("id") DO UPDATE SET "title" = :title`)
            .execute();
    }

    public async createRootPermission() {
        const service = await this.serviceService.findRootService();
        await this.permissionRepository.manager.createQueryBuilder()
            .insert()
            .into(Permission)
            .values({
                ...PermissionCatalog.SUPER,
                service
            })
            .orIgnore(`("id") DO UPDATE SET "title" = :title`)
            .execute();
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

    public async findAllCategorizedByService(): Promise<Service[]> {
        return this.serviceService.getRepository().find({ relations: ["permissions"], select: ["id", "title", "description"] })
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
        return this.permissionRepository.findOne({ where: { value }})
    }

    public async registerPermissionsForService(serviceId: string, data: PermissionDTO[]): Promise<Permission[]> {
        const service: Service = await this.serviceService.findById(serviceId);
        if(!service) throw new NotFoundException(); 

        return this.permissionRepository.save(data.map((value) => {
            const p = {}//new Permission(value.value, value.title);
            return p;
        }));
    }

    public async findRootPermission(): Promise<Permission> {
        return this.findByValue("*")
    }

    /*public async findOrCreateRootPermission(): Promise<Permission> {
        const permission = await this.findRootPermission();
        if(!permission) {
            return this.permissionRepository.save(new Permission("*", "Administrator", await this.serviceService.findRootService()))
        }
        return permission;
    }*/
}
