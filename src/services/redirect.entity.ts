import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Service } from "./service.entity";

@Entity()
export class ServiceRedirectUri {

    @PrimaryGeneratedColumn("uuid")
    public id: string;

    @ApiProperty()
    @Column({ nullable: false })
    public uri: string;

    @ManyToOne(() => Service, { nullable: false, onDelete: "CASCADE" })
    @JoinColumn()
    public service: Service;

}