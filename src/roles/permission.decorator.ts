import { applyDecorators, SetMetadata } from "@nestjs/common"
import { ApiBearerAuth } from "@nestjs/swagger";

export const PERMISSION_KEY = "requiredPermission"
export const Permission = (permission: string) => {
    return applyDecorators(
        SetMetadata(PERMISSION_KEY, permission),
        ApiBearerAuth()
    )
}