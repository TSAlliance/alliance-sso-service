import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Pageable } from 'nestjs-pager';
import { RoleDTO } from './role.entity';
import { RoleService } from './role.service';

@ApiTags("Roles Controller")
@Controller('roles')
export class RolesController {
    constructor(
        private roleService: RoleService
    ){}

    @Get()
    public async listAll(@Pageable() pageable: Pageable) {
        return this.roleService.findAll(pageable)
    }

    @Get(":roleId")
    public async getById(@Param("roleId") roleId: string) {
        return this.roleService.findById(roleId)
    }

    @Post()
    public async createService(@Body() role: RoleDTO) {
        return this.roleService.createRole(role);
    }

    @Put(":roleId")
    public async updateService(@Param("roleId") roleId: string, @Body() role: RoleDTO) {
        return this.roleService.updateRole(roleId, role);
    }

    @Delete(":roleId")
    public async deleteService(@Param("roleId") roleId: string) {
        return this.roleService.deleteRole(roleId);
    }

}
