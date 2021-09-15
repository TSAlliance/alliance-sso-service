import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Pageable } from 'nestjs-pager';
import { Permission } from './permission.decorator';
import { PermissionDTO } from './permission.entity';
import { PermissionCatalog } from './permission.registry';
import { PermissionService } from './permission.service';

@Controller('permissions')
@ApiTags("Permission Controller")
export class PermissionController {

    constructor(private permissionService: PermissionService) {}

    @Put("service/:serviceId")
    @ApiOperation({
        description: "Register permissions for a service"
    })
    @ApiBody({
        isArray: true,
        type: [PermissionDTO],
        required: true
    })
    // TODO: Service account only decorator (file: account.decorator.ts)
    public async registerPermissions(@Param("serviceId") serviceId: string, @Body() permissions: PermissionDTO[]) {
        return this.permissionService.registerPermissionsForService(serviceId, permissions);
    }

    @Get()
    @Permission(PermissionCatalog.PERMISSIONS_READ)
    public async listByServices(@Pageable() pageable: Pageable) {
        return this.permissionService.findAllCategorizedByService(pageable)
    }

}
