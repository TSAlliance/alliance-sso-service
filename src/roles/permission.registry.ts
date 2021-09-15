
export interface PermissionItem {
    id: string;
    title: string;
}

class PermissionRegistry {

    SUPER: PermissionItem = { id: "*", title: "Administrator" }
    USERS_READ: PermissionItem = { id: "users.read", title: "Create and edit users." }
    USERS_WRITE: PermissionItem = { id: "users.write", title: "Administrator" }
    ROLES_READ: PermissionItem = { id: "roles.read", title: "Administrator" }
    ROLES_WRITE: PermissionItem = { id: "roles.write", title: "Administrator" }
    SERVICES_READ: PermissionItem = { id: "services.read", title: "Administrator" }
    SERVICES_WRITE: PermissionItem = { id: "services.write", title: "Administrator" }
    INVITES_READ: PermissionItem = { id: "invites.read", title: "Administrator" }
    INVITES_WRITE: PermissionItem = { id: "invites.write", title: "Administrator" }
    PERMISSIONS_READ: PermissionItem = { id: "permissions.read", title: "Administrator" }

}

export const PermissionCatalog = new PermissionRegistry()
