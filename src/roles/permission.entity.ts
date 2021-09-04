import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, PrimaryColumn } from "typeorm";

export class PermissionDTO {
    @ApiProperty({ required: false, maxLength: 32, minLength: 3 })
    title: string;

    @ApiProperty({ required: false, maxLength: 120, minLength: 3 })
    description?: string;

    @ApiProperty({ required: true, maxLength: 120, minLength: 3 })
    id: string
}

@Entity()
export class Permission implements PermissionDTO {

    @PrimaryColumn("varchar", {
        length: 256
    })
    public id: string;

    @Column({ nullable: false })
    public title: string;

    /**
     * Create a new permission object
     * @param title Title to appear in the front-end
     * @param service Service that owns the permission
     * @param value Permission value
     */
    constructor(value: string, title: string) {
        this.title = title;
        this.id = Permission.formatPermission(value)
    }

    public static formatPermission(permission: string): string {
        return "alliance." + permission;
    }

}