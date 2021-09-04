import { Injectable, NotFoundException } from '@nestjs/common';
import { Validator } from '@tsalliance/rest';
import { Page, Pageable } from 'nestjs-pager';
import { DeleteResult, FindManyOptions } from 'typeorm';
import { Permission } from './permission.entity';
import { PermissionService } from './permission.service';
import { Role, RoleDTO } from './role.entity';
import { RoleRepository } from './role.repository';

@Injectable()
export class RoleService {
    constructor(private roleRepository: RoleRepository, private permissionService: PermissionService){}

    public async findAll(pageable: Pageable, options?: FindManyOptions<Role>): Promise<Page<Role>> {
        return this.roleRepository.findAll(pageable, options);
    }

    public async findById(roleId: string): Promise<Role> {
        return this.roleRepository.findOne({ id: roleId })
    }

    public async findRootRole(): Promise<Role> {
        return this.findById("*");
    }

    public async findOrCreateRootRole(): Promise<Role> {
        let role = await this.findRootRole();

        if(!role) {
            role = new Role();
            role.id = "*"
            role.title = "root"
            role.description = "Super admin role that has every possible permission.";
            role.permissions = [ await this.permissionService.findOrCreateRootPermission() ]

            role = await this.roleRepository.save(role)
        }

        return role;
    }

    public async createRole(data: RoleDTO): Promise<Role> {
        const validator = new Validator();
        const role = new Role();
        const existsByTitle = !!await this.roleRepository.exists({ title: data.title });

        validator.text("title", data.title).alphaNum().minLen(3).maxLen(32).required().unique(() => existsByTitle).check();
        if(validator.text("description", data.description).notBlank().minLen(3).maxLen(120).check()) {
            role.description = data.description;
        }
        
        validator.throwErrors();

        role.title = data.title;
        if(data.permissions) role.permissions = data.permissions;
        return this.roleRepository.save(role);
    }

    public async updateRole(roleId: string, data: RoleDTO): Promise<Role> {
        const validator = new Validator()
        const role: Role = await this.findById(roleId);        
        if(!role) throw new NotFoundException();

        if(validator.text("title", data.title).alpha().minLen(3).maxLen(32).check()) {
            role.title = data.title;
        }
        if(validator.text("description", data.description).minLen(3).maxLen(120).check()) {
            role.description = data.description;
        }

        validator.throwErrors();
        
        if(data.permissions) role.permissions = data.permissions;
        return this.roleRepository.save(role);
    }

    public async deleteRole(id: string): Promise<DeleteResult> {
        return this.roleRepository.delete({ id });
    }
}
