import { ApiProperty } from "@nestjs/swagger";
import { RandomUtil } from "@tsalliance/rest";
import { CanReadPermission } from "src/permission/permission.decorator";
import { PermissionCatalog } from "src/permission/permission.registry";
import { Role } from "src/roles/role.entity";
import { User } from "src/users/user.entity";
import { BeforeInsert, Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn } from "typeorm";

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

    @CanReadPermission(PermissionCatalog.INVITES_READ)
    @Column({ nullable: false, default: 0 })
    public maxUses: number;

    @CanReadPermission(PermissionCatalog.INVITES_READ)
    @Column({ nullable: false, default: 0 })
    public uses: number;

    @CanReadPermission(PermissionCatalog.INVITES_READ)
    @CreateDateColumn()
    public createdAt: Date;

    @CanReadPermission(PermissionCatalog.INVITES_READ)
    @Column({ nullable: true })
    public expiresAt?: Date;

    @ManyToOne(() => User, { onDelete: "CASCADE", eager: true })
    public inviter: User;

    @ManyToOne(() => Role, { nullable: true, onDelete: "CASCADE" })
    public asignRole: Role;

    @BeforeInsert()
    public populateCode() {
        this.id = RandomUtil.randomString(6).toUpperCase();
    }

}