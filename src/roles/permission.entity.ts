import { Service } from "src/service/service.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Permission {

    @PrimaryGeneratedColumn("uuid")
    public id: string;

    @Column({ nullable: false })
    public title: string;

    @Column()
    public description?: string;

    @ManyToOne(() => Service, { nullable: false, onDelete: "CASCADE" })
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
    constructor(title: string, service: Service, value: string) {
        this.title = title;
        this.service = service;
        this.permissionValue = "alliance." + (this.service?.id || "default") + "." + value;
    }

}