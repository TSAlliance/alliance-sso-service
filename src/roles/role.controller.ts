import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Pageable } from 'nestjs-pager';
import { Permission } from './permission.decorator';
import { RoleDTO } from './role.entity';
import { RoleService } from './role.service';

@ApiTags("Roles Controller")
@Controller('roles')
export class RolesController {
    constructor(
        private roleService: RoleService
    ){}

    @Get()
    @ApiBearerAuth()
    @Permission("def")
    public async listAll(@Pageable() pageable: Pageable) {
        return this.roleService.findAll(pageable)
    }

    @Get(":roleId")
    @ApiBearerAuth()
    public async getById(@Param("roleId") roleId: string) {
        return this.roleService.findById(roleId)
    }

    @Post()
    @ApiBearerAuth()
    public async createRole(@Body() role: RoleDTO) {
        return this.roleService.createRole(role);
    }

    @Put(":roleId")
    @ApiBearerAuth()
    public async updateRole(@Param("roleId") roleId: string, @Body() role: RoleDTO) {
        return this.roleService.updateRole(roleId, role);
    }

    @Delete(":roleId")
    @ApiBearerAuth()
    public async deleteRole(@Param("roleId") roleId: string) {
        return this.roleService.deleteRole(roleId);
    }

}