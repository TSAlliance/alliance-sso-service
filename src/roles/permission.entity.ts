import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Service } from "../services/service.entity";

export class PermissionDTO {
    @ApiProperty({ required: false, maxLength: 32, minLength: 3 })
    title: string;

    @ApiProperty({ required: false, maxLength: 120, minLength: 3 })
    description?: string;

    @ApiProperty({ required: true, maxLength: 120, minLength: 3 })
    permissionValue: string
}

@Entity()
export class Permission implements PermissionDTO {

    @PrimaryGeneratedColumn("uuid")
    public id: string;

    @Column({ nullable: false })
    public title: string;

    @Column()
    public description?: string;

    @ManyToOne(() => Service, { nullable: true, onDelete: "CASCADE" })
    @JoinColumn()
    public service?: Service;

    @Column()
    public readonly permissionValue: string;

    /**
     * Create a new permission object
     * @param title Title to appear in the front-end
     * @param service Service that owns the permission
     * @param value Permission value
     */
    constructor(title: string, value: string, service?: Service) {
        this.title = title;
        this.permissionValue = "alliance." + (this.service?.id || "default") + "." + value;
        this.service = service;
    }

}