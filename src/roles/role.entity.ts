import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Permission } from "./permission.entity";

export class RoleDTO {
    title: string;
    description?: string;
    permissions?: Permission[]
}

@Entity()
export class Role implements RoleDTO {

    @PrimaryGeneratedColumn("uuid")
    public id: string;

    @Column({ length: 32, nullable: false, unique: true })
    public title: string;

    @Column({ length: 120, nullable: true })
    public description: string;

    @ManyToMany(() => Permission, { eager: true, cascade: true })
    @JoinTable()
    public permissions: Permission[]

}