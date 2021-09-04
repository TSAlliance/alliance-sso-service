import { ApiProperty } from "@nestjs/swagger";
import { RandomUtil } from "@tsalliance/rest";
import { Role } from "src/roles/role.entity";
import { User } from "src/users/user.entity";
import { BeforeInsert, Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

export class InviteDTO {
    @ApiProperty({ required: false })
    expiresAt?: Date;

    @ApiProperty({ required: false, default: 0 })
    maxUses?: number;

    @ApiProperty({ required: false })
    asignRole?: Role
}

@Entity()
export class Invite implements InviteDTO {

    @PrimaryColumn("varchar", { length: 6 })
    public id: string;

    @Column({ nullable: false, default: 0 })
    public maxUses: number;

    @Column({ nullable: false, default: 0 })
    public uses: number;

    @CreateDateColumn()
    public createdAt: Date;

    @Column({ nullable: true })
    public expiresAt?: Date;

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    public inviter: User;

    @ManyToOne(() => Role, { nullable: true, onDelete: "CASCADE" })
    public asignRole?: Role;

    @BeforeInsert()
    public populateCode() {
        this.id = RandomUtil.randomString(6).toUpperCase();
    }

}