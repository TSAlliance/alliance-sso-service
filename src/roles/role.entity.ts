import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Permission } from "./permission.entity";

export class RoleDTO {
    @ApiProperty({ required: true, maxLength: 32, minLength: 3 })
    title: string;

    @ApiProperty({ required: false, maxLength: 120, minLength: 3 })
    description?: string;

    @ApiProperty({ required: false, default: [], isArray: true })
    permissions?: Permission[]
}

@Entity()
export class Role implements RoleDTO {

    @PrimaryGeneratedColumn("uuid")
    public id: string;

    @Column({ length: 32, nullable: false, unique: true })
    public title: string;

    @Column({ length: 120, nullable: true })
    public description?: string;

    @ManyToMany(() => Permission, { eager: true })
    @JoinTable({ name: "role_permissions" })
    public permissions: Permission[]

}