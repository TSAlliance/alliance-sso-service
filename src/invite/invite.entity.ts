import { ApiProperty } from "@nestjs/swagger";
import { RandomUtil } from "@tsalliance/rest";
import { Role } from "src/roles/role.entity";
import { User } from "src/users/user.entity";
import { BeforeInsert, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

export class InviteDTO {
    @ApiProperty({ required: false })
    expiresAt?: Date;

    @ApiProperty({ required: false, default: 0 })
    maxUses?: number;
}

@Entity()
export class Invite implements InviteDTO {

    @PrimaryGeneratedColumn("uuid")
    public id: string;

    @Column({ nullable: false, default: 0 })
    public maxUses: number;

    @Column({ nullable: false, length: 6 })
    public code: string;

    @CreateDateColumn()
    public createdAt: Date;

    @Column({ nullable: true })
    public expiresAt?: Date;

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    public inviter: User;

    @ManyToOne(() => Role, { nullable: true, onDelete: "CASCADE" })
    public asignRole: Role;

    @BeforeInsert()
    public populateCode() {
        this.code = RandomUtil.randomString(6);
    }

}