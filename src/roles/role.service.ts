import { Injectable, NotFoundException } from '@nestjs/common';
import { Validator } from '@tsalliance/rest';
import { Page, Pageable } from 'nestjs-pager';
import { DeleteResult, FindManyOptions } from 'typeorm';
import { Permission } from './permission.entity';
import { Role, RoleDTO } from './role.entity';
import { RoleRepository } from './role.repository';

@Injectable()
export class RoleService {
    constructor(
        private roleRepository: RoleRepository,
        private validator: Validator
    ){}

    public async findAll(pageable: Pageable, options?: FindManyOptions<Role>): Promise<Page<Role>> {
        return this.roleRepository.findAll(pageable, options);
    }

    public async findById(roleId: string): Promise<Role> {
        return this.roleRepository.findOne({ id: roleId })
    }

    public async createRole(data: RoleDTO): Promise<Role> {
        const role = new Role();

        this.validator.text("title", data.title).alphaNum().minLen(3).maxLen(32).required().check();
        if(data.description && this.validator.text("description", data.description).alphaNum().minLen(3).maxLen(120).check()) {
            role.description = data.description;
        }
        
        this.validator.throwErrors();

        role.title = data.title;
        if(data.permissions) role.permissions = data.permissions;
        return this.roleRepository.save(role);
    }

    public async updateRole(roleId: string, data: RoleDTO): Promise<Role> {
        const role: Role = await this.findById(roleId);        
        if(!role) throw new NotFoundException();

        if(data.title && this.validator.text("title", data.title).alpha().minLen(3).maxLen(32).check()) {
            role.title = data.title;
        }
        if(data.description && this.validator.text("description", data.description).alphaNum().minLen(3).maxLen(120).check()) {
            role.description = data.description;
        }

        this.validator.throwErrors();
        
        if(data.permissions) role.permissions = data.permissions;
        return this.roleRepository.save(role);
    }

    public async deleteRole(id: string): Promise<DeleteResult> {
        return this.roleRepository.delete({ id });
    }

    public async init() {
        console.log("creating default role...");
        
        console.log(!(await this.findById("*")))
        if(!(await this.findById("*"))) {
            return this.createRole({
                title: "root",
                description: "Super admin role that has every possible permission.",
                permissions: [ 
                    new Permission("Administrator", "*")
                ]
            });
        }
    }
}
