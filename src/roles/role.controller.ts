import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Pageable } from 'nestjs-pager';
import { Account } from 'src/account/account.entity';
import { Authentication } from 'src/authentication/authentication.decorator';
import { Permission } from './permission.decorator';
import { PermissionCatalog } from './permission.registry';
import { RoleDTO } from './role.entity';
import { RoleService } from './role.service';

@ApiTags("Roles Controller")
@Controller('roles')
export class RolesController {
    constructor(
        private roleService: RoleService
    ){}

    @Get()
    @Permission(PermissionCatalog.ROLES_READ)
    public async listAll(@Pageable() pageable: Pageable, @Authentication() authentication: Account) {
        return this.roleService.findAll(pageable, null, authentication)
    }

    @Get(":roleId")
    @Permission(PermissionCatalog.ROLES_READ)
    public async findById(@Param("roleId") roleId: string, @Authentication() authentication: Account) {
        return this.roleService.findById(roleId, { relations: ["permissions"] }, authentication)
    }

    @Post()
    @Permission(PermissionCatalog.ROLES_WRITE)
    public async createRole(@Body() role: RoleDTO) {
        return this.roleService.createRole(role);
    }

    @Put(":roleId")
    @Permission(PermissionCatalog.ROLES_WRITE)
    public async updateRole(@Param("roleId") roleId: string, @Body() role: RoleDTO) {
        return this.roleService.updateRole(roleId, role);
    }

    @Delete(":roleId")
    @Permission(PermissionCatalog.ROLES_WRITE)
    public async deleteRole(@Param("roleId") roleId: string) {
        return this.roleService.deleteRole(roleId);
    }

}
