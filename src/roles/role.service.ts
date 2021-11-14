import { Injectable, NotFoundException } from '@nestjs/common';
import { InsufficientPermissionException, RestService, Validator } from '@tsalliance/rest';
import { Page, Pageable } from 'nestjs-pager';
import { Account } from 'src/account/account.entity';
import { PermissionService } from 'src/permission/permission.service';
import { DeleteResult, FindManyOptions } from 'typeorm';
import { Role, RoleDTO } from './role.entity';
import { RoleRepository } from './role.repository';

export const ROOT_ROLE_ID = "*"
export const ROOT_ROLE_HIERARCHY = 1000

@Injectable()
export class RoleService extends RestService<Role, RoleDTO, RoleRepository> {
    constructor(private roleRepository: RoleRepository, private permissionService: PermissionService){
        super(roleRepository)
    }

    public async findAll(pageable: Pageable, options?: FindManyOptions<Role>): Promise<Page<Role>> {
        const result = await this.roleRepository.findAll(pageable, options)
        return result
    }

    public async findById(roleId: string, options?: FindManyOptions<Role>): Promise<Role> {
        const result = await this.roleRepository.findOne({...options, where: { id: roleId }})
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
            description: "Super admin role that has every possible permission.",
            hierarchy: ROOT_ROLE_HIERARCHY
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
            .add(rootPermission)
            .catch(() => { /* Do nothing */ })
    }

    public async create(data: RoleDTO): Promise<Role> {
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

    public async update(roleId: string, data: RoleDTO, account?: Account): Promise<Role> {
        const validator = new Validator()
        const role: Role = await this.findById(roleId);        
        if(!role) throw new NotFoundException();

        if(roleId == ROOT_ROLE_ID || account && account.getHierarchy() < role.hierarchy) {
            throw new InsufficientPermissionException();
        }

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

    public async delete(id: string, account?: Account): Promise<DeleteResult> {
        return this.roleRepository.manager.transaction(async () => {
            const role = await this.findById(id);

            if(id == ROOT_ROLE_ID || account && account.getHierarchy() < role.hierarchy) {
                throw new InsufficientPermissionException()
            }
            
            const result = await this.roleRepository.delete(role);
            return result;
        })
    }
}
