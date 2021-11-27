import { CanRead, RandomUtil } from "@tsalliance/rest";
import { PermissionCatalog } from "src/permission/permission.registry";
import { Role } from "src/roles/role.entity";
import { User } from "src/users/user.entity";
import { BeforeInsert, Column, CreateDateColumn, ManyToOne, PrimaryColumn } from "typeorm";

export class Invite {
    @PrimaryColumn("varchar", { length: 6 })
    public id: string;

    @CanRead([PermissionCatalog.INVITES_READ, PermissionCatalog.INVITES_WRITE])
    @Column({ nullable: false, default: 0 })
    public maxUses: number;

    @CanRead([PermissionCatalog.INVITES_READ, PermissionCatalog.INVITES_WRITE])
    @Column({ nullable: false, default: 0 })
    public uses: number;

    @CanRead([PermissionCatalog.INVITES_READ, PermissionCatalog.INVITES_WRITE])
    @CreateDateColumn()
    public createdAt: Date;

    @CanRead([PermissionCatalog.INVITES_READ, PermissionCatalog.INVITES_WRITE])
    @CreateDateColumn()
    public updatedAt: Date;

    @CanRead([PermissionCatalog.INVITES_READ, PermissionCatalog.INVITES_WRITE])
    @Column({ nullable: true })
    public expiresAt?: Date;

    @ManyToOne(() => User, { onDelete: "CASCADE", eager: true })
    public inviter: User;

    @ManyToOne(() => Role, { nullable: true, onDelete: "CASCADE" })
    public assignRole: Role;

    @BeforeInsert()
    public populateCode() {
        this.id = RandomUtil.randomString(6).toUpperCase();
    }

}
