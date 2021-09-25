import { Injectable, NotFoundException } from '@nestjs/common';
import { Validator } from '@tsalliance/rest';
import { Page, Pageable } from 'nestjs-pager';
import { Account } from 'src/account/account.entity';
import { PermissionService } from 'src/permission/permission.service';
import { DeleteResult, FindManyOptions } from 'typeorm';
import { Role, RoleDTO } from './role.entity';
import { RoleRepository } from './role.repository';

export const ROOT_ROLE_ID = "*"

@Injectable()
export class RoleService {
    constructor(private roleRepository: RoleRepository, private permissionService: PermissionService){}

    public async findAll(pageable: Pageable, options: FindManyOptions<Role> = {}, authentication?: Account): Promise<Page<Role>> {
        if(!options) options = {}

        const result = await this.roleRepository.findAll(pageable, options)
        result.elements.map((role) => {
            if(!authentication?.hasPermission("roles.read")) {
                return role?.restricted()
            } else {
                return role;
            }
        })
        return result
    }

    public async findById(roleId: string, options: FindManyOptions<Role> = {}, authentication?: Account): Promise<Role> {
        if(!options) options = {}

        options.where = { id: roleId }
        const result = await this.roleRepository.findOne(options)
        if(!authentication?.hasPermission("roles.read")) {
            return result?.restricted()
        }

        return result;
    }

    public async findRootRole(): Promise<Role> {
        return this.findById(ROOT_ROLE_ID);
    }

    public async createRootRole() {
        const rootPermission = await this.permissionService.findRootPermission();
        const role = {
            id: ROOT_ROLE_ID,
            title: "root",
            description: "Super admin role that has every possible permission."
        }
        
        await this.roleRepository.manager.createQueryBuilder()
            .relation(Role, "permissions")
            .insert()
            .into(Role)
            .values(role)
            .orIgnore(`("id") DO UPDATE SET "title" = :title, "description" = :description`)
            .execute()
            .catch(() => { /* Do nothing */ })
        
        await this.roleRepository.manager.createQueryBuilder()
            .relation(Role, "permissions")
            .of(role)
            .add(rootPermission).then(() => {
                console.log("inserted relation")
            })
            .catch(() => { /* Do nothing */ })
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
