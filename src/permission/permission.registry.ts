import { IPermission } from "@tsalliance/rest";

export class PermissionItem implements IPermission {
    value: string;
    title: string;
}

class PermissionRegistry {

    SUPER: PermissionItem = { value: "*", title: "Administrator" }
    USERS_READ: PermissionItem = { value: "users.read", title: "Access all users and read information." }
    USERS_WRITE: PermissionItem = { value: "users.write", title: "Create and edit users." }
    ROLES_READ: PermissionItem = { value: "roles.read", title: "Access all roles and read information." }
    ROLES_WRITE: PermissionItem = { value: "roles.write", title: "Create and edit roles." }
    SERVICES_READ: PermissionItem = { value: "services.read", title: "Access all services and read information." }
    SERVICES_WRITE: PermissionItem = { value: "services.write", title: "Create and edit services." }
    INVITES_READ: PermissionItem = { value: "invites.read", title: "Access all invites and read information." }
    INVITES_WRITE: PermissionItem = { value: "invites.write", title: "Create and edit invites." }
    PERMISSIONS_READ: PermissionItem = { value: "permissions.read", title: "Access all permissions and read information." }

}

export const PermissionCatalog = new PermissionRegistry()
