import { applyDecorators, SetMetadata } from "@nestjs/common"
import { ApiBearerAuth } from "@nestjs/swagger";
import { PermissionItem } from "./permission.registry";

export const PERMISSION_KEY = "requiredPermission"
export const CANREAD_KEY = "canRead"

// Applying multiple permissions can be considered as an OR check statement
// So if one permission applies to the user, he is considered granted
export const Permission = (...permission: PermissionItem[]) => {
    return applyDecorators(
        SetMetadata(PERMISSION_KEY, permission),
        (ApiBearerAuth ? ApiBearerAuth() : undefined)
    )
}

export const CanReadPermission = (...permission: PermissionItem[]) => {
    return Reflect.metadata(PERMISSION_KEY, permission);
}

export const CanRead = (value = true) => {
    return Reflect.metadata(CANREAD_KEY, value);
}