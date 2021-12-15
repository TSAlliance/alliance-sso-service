import { ApiProperty } from "@nestjs/swagger";
import { CanRead } from "@tsalliance/rest";
import { Permission, PermissionDTO } from "src/permission/permission.entity";
import { PermissionCatalog } from "src/permission/permission.registry";
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

export class RoleDTO {
    @ApiProperty({ required: true, maxLength: 32, minLength: 3 })
    title: string;

    @ApiProperty({ required: false, maxLength: 120, minLength: 3 })
    description?: string;

    @ApiProperty({ required: false, default: [], isArray: true, type: () => PermissionDTO })
    permissions?: Permission[];

    @ApiProperty({ required: false, default: 0, maximum: 999, minimum: 0 })
    hierarchy?: number;
}

@Entity()
export class Role {

    @PrimaryGeneratedColumn("uuid")
    public id: string;

    @Column({ length: 32, nullable: false, unique: true })
    public title: string;

    @CanRead([PermissionCatalog.ROLES_READ,PermissionCatalog.ROLES_WRITE])
    @Column({ length: 120, nullable: true })
    public description?: string;

    @CanRead([PermissionCatalog.ROLES_READ,PermissionCatalog.ROLES_WRITE])
    @ManyToMany(() => Permission)
    @JoinTable({ name: "role_permissions" })
    public permissions: Permission[] | string[]

    @CanRead([PermissionCatalog.ROLES_READ,PermissionCatalog.ROLES_WRITE])
    @Column({ nullable: false, default: 0 })
    public hierarchy: number;

}