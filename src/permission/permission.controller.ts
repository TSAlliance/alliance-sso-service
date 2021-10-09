import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Permission, RequireAuth } from '@tsalliance/rest';
import { Authentication } from '@tsalliance/rest/dist/decorator/authentication.decorator';
import { Account } from 'src/account/account.entity';
import { PermissionDTO } from './permission.entity';
import { PermissionCatalog } from './permission.registry';
import { PermissionService } from './permission.service';

@Controller('permissions')
@ApiTags("Permission Controller")
export class PermissionController {

    constructor(private permissionService: PermissionService) {}

    @Put()
    @ApiOperation({
        description: "Register permissions for a service"
    })
    @ApiBody({
        isArray: true,
        type: () => PermissionDTO,
        required: true
    })
    @RequireAuth()
    public async registerPermissions(@Body() permissions: PermissionDTO[], @Authentication() account: Account) {
        return this.permissionService.registerPermissionsForService(account.id, permissions);
    }

    @Get("/categorized")
    @Permission(PermissionCatalog.PERMISSIONS_READ)
    public async findAllCategorizedByService() {
        return this.permissionService.findAllCategorizedByService()
    }

}
