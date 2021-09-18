import { applyDecorators, SetMetadata } from "@nestjs/common"
import { ApiBearerAuth } from "@nestjs/swagger";
import { PermissionItem } from "./permission.registry";

export const PERMISSION_KEY = "requiredPermission"

// Applying multiple permissions can be considered as an OR check statement
// So if one permission applies to the user, he is considered granted
export const Permission = (...permission: PermissionItem[]) => {
    return applyDecorators(
        SetMetadata(PERMISSION_KEY, permission),
        ApiBearerAuth()
    )
}