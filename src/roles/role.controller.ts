import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Pageable } from 'nestjs-pager';
import { Permission } from 'src/permission/permission.decorator';
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
    @Permission(PermissionCatalog.ROLES_READ)
    public async listAll(@Pageable() pageable: Pageable) {
        return this.roleService.findAll(pageable)
    }

    @Get(":roleId")
    @Permission(PermissionCatalog.ROLES_READ)
    public async findById(@Param("roleId") roleId: string) {
        return this.roleService.findById(roleId, { relations: ["permissions"] })
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
