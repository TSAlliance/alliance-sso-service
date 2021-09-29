import { applyDecorators, SetMetadata } from "@nestjs/common"

export const PERMISSION_KEY = "requiredPermission"

// Applying multiple permissions can be considered as an OR check statement
// So if one permission applies to the user, he is considered granted
export const Permission = (...permission: string[]) => {
    return applyDecorators(
        SetMetadata(PERMISSION_KEY, permission)
    )
}