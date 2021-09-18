import { ApiProperty } from "@nestjs/swagger";
import { Permission, PermissionDTO } from "src/permission/permission.entity";
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

export class RoleDTO {
    @ApiProperty({ required: true, maxLength: 32, minLength: 3 })
    title: string;

    @ApiProperty({ required: false, maxLength: 120, minLength: 3 })
    description?: string;

    @ApiProperty({ required: false, default: [], isArray: true, type: () => PermissionDTO })
    permissions?: Permission[]
}

@Entity()
export class Role {

    @PrimaryGeneratedColumn("uuid")
    public id: string;

    @Column({ length: 32, nullable: false, unique: true })
    public title: string;

    @Column({ length: 120, nullable: true })
    public description?: string;

    @ManyToMany(() => Permission)
    @JoinTable({ name: "role_permissions" })
    public permissions: Permission[]

    public restricted(): Role {
        return {
            ...this,
            description: undefined,
            permissions: undefined
        }
    }

}