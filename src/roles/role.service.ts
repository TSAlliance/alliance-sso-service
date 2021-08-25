import { Injectable, NotFoundException } from '@nestjs/common';
import { Validator } from '@tsalliance/rest';
import { Page, Pageable } from 'nestjs-pager';
import { DeleteResult, FindManyOptions } from 'typeorm';
import { Role, RoleDTO } from './role.entity';
import { RoleRepository } from './role.repository';

@Injectable()
export class RolesService {
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
        this.validator.text("title", data.title).alphaNum().minLen(3).maxLen(32).required().check();
        this.validator.throwErrors();

        const role = new Role(data.title);
        return this.roleRepository.save(role);
    }

    public async updateRole(roleId: string, data: RoleDTO): Promise<Role> {
        const role: Role = await this.findById(roleId);        
        if(!role) throw new NotFoundException();

        if(this.validator.text("title", data.title).alpha().minLen(3).maxLen(32).check()) {
            if(data.title) role.title = data.title;
        }

        this.validator.throwErrors();
        
        if(data.permissions) role.permissions = data.permissions;
        return this.roleRepository.save(role);
    }

    public async deleteRole(id: string): Promise<DeleteResult> {
        return this.roleRepository.delete({ id });
    }
}
