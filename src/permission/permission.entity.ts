import { ApiProperty } from "@nestjs/swagger";
import { Service } from "src/services/service.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

export class PermissionDTO {
    @ApiProperty({ required: false, maxLength: 32, minLength: 3 })
    title: string;

    @ApiProperty({ required: true, maxLength: 120, minLength: 3 })
    value: string
}

@Entity()
export class Permission implements PermissionDTO {

    @PrimaryGeneratedColumn("uuid")
    public id: string;

    @Column({ nullable: false, unique: true })
    public value: string;

    @Column({ nullable: false })
    public title: string;

    @ManyToOne(() => Service, { onDelete: "CASCADE", nullable: false })
    @JoinColumn()
    public service: Service;

    /**
     * Create a new permission object
     * @param title Title to appear in the front-end
     * @param service Service that owns the permission
     * @param value Permission value
     */
    constructor(value: string, title: string, service: Service) {
        this.value = value;
        this.title = title;
        this.service = service;
    }

}