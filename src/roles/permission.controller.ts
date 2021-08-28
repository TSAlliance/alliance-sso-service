import { Body, Controller, Param, Put } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PermissionDTO } from './permission.entity';
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
    public async registerPermissions(@Param("serviceId") serviceId: string, @Body() permissions: PermissionDTO[]) {
        return this.permissionService.registerPermissionsForService(serviceId, permissions);
    }

}
