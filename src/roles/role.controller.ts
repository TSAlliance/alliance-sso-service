import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Authentication, CanAccess } from '@tsalliance/rest';
import { Pageable } from 'nestjs-pager';
import { Account } from 'src/account/account.entity';
import { PermissionCatalog } from 'src/permission/permission.registry';
import { RoleDTO } from './role.entity';
import { RoleService } from './role.service';

@ApiTags("Roles Controller")
@Controller('roles')
export class RolesController {
    constructor(
        private roleService: RoleService
    ){}

    @Get()
    @CanAccess([PermissionCatalog.ROLES_READ,PermissionCatalog.ROLES_WRITE])
    public async listAll(@Pageable() pageable: Pageable) {
        return this.roleService.findAll(pageable)
    }

    @Get(":roleId")
    @CanAccess([PermissionCatalog.ROLES_READ,PermissionCatalog.ROLES_WRITE])
    public async findById(@Param("roleId") roleId: string) {
        return this.roleService.findById(roleId, { relations: ["permissions"] })
    }

    @Post()
    @CanAccess(PermissionCatalog.ROLES_WRITE)
    public async createRole(@Body() role: RoleDTO) {
        return this.roleService.create(role);
    }

    @Put(":roleId")
    @CanAccess(PermissionCatalog.ROLES_WRITE)
    public async updateRole(@Param("roleId") roleId: string, @Body() role: RoleDTO, @Authentication() account: Account) {
        return this.roleService.update(roleId, role, account);
    }

    @Delete(":roleId")
    @CanAccess(PermissionCatalog.ROLES_WRITE)
    public async deleteRole(@Param("roleId") roleId: string, @Authentication() account: Account) {
        return this.roleService.delete(roleId, account);
    }

}
