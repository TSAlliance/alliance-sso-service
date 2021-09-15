import { applyDecorators, SetMetadata } from "@nestjs/common"
import { ApiBearerAuth } from "@nestjs/swagger";
import { PermissionItem } from "./permission.registry";

export const PERMISSION_KEY = "requiredPermission"
export const Permission = (permission: PermissionItem) => {
    return applyDecorators(
        SetMetadata(PERMISSION_KEY, permission?.id),
        ApiBearerAuth()
    )
}