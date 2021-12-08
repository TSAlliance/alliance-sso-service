import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CanAccess, IsAuthenticated, RestAccount } from '@tsalliance/rest';
import { Authentication } from '@tsalliance/rest/dist/decorator/authentication.decorator';
import { Service } from 'src/services/service.entity';
import { User } from 'src/users/user.entity';
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
    @IsAuthenticated()
    public async registerPermissions(@Body() permissions: PermissionDTO[], @Authentication() account: RestAccount) {
        return this.permissionService.registerPermissionsForService((account as Service).id, permissions);
    }

    @Get("/categorized")
    @CanAccess([PermissionCatalog.PERMISSIONS_READ])
    public async findAllCategorizedByService() {
        return this.permissionService.findAllCategorizedByService()
    }

}
