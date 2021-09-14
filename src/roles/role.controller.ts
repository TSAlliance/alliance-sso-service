import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Pageable } from 'nestjs-pager';
import { Account } from 'src/account/account.entity';
import { Authentication } from 'src/authentication/authentication.decorator';
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
    @Permission("roles.read")
    public async listAll(@Pageable() pageable: Pageable, @Authentication() authentication: Account) {
        return this.roleService.findAll(pageable, null, authentication)
    }

    @Get(":roleId")
    @Permission("roles.read")
    public async findById(@Param("roleId") roleId: string, @Authentication() authentication: Account) {
        return this.roleService.findById(roleId, { relations: ["permissions"] }, authentication)
    }

    @Post()
    @Permission("roles.write")
    public async createRole(@Body() role: RoleDTO) {
        return this.roleService.createRole(role);
    }

    @Put(":roleId")
    @Permission("roles.write")
    public async updateRole(@Param("roleId") roleId: string, @Body() role: RoleDTO) {
        return this.roleService.updateRole(roleId, role);
    }

    @Delete(":roleId")
    @Permission("roles.write")
    public async deleteRole(@Param("roleId") roleId: string) {
        return this.roleService.deleteRole(roleId);
    }

}
