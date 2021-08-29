import { SetMetadata } from "@nestjs/common"

export const PERMISSION_KEY = "requiredPermission"
export const Permission = (permission: string) => {
    return SetMetadata(PERMISSION_KEY, permission);
}