import { Controller, Get, Param } from '@nestjs/common';
import { Pageable } from 'nestjs-pager';
import { RolesService } from './role.service';

@Controller('roles')
export class RolesController {
    constructor(
        private roleService: RolesService
    ){}

    @Get()
    public async listAll(@Pageable() pageable: Pageable) {
        return this.roleService.findAll(pageable, { relations: ["permission"] })
    }

    @Get(":roleId")
    public async getById(@Param("roleId") roleId: string) {
        return this.roleService.findById(roleId)
    }

    

}
