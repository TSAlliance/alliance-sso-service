import { Injectable } from '@nestjs/common';
import { RestService, Validator } from '@tsalliance/rest';
import { Page, Pageable } from 'nestjs-pager';
import { Account } from 'src/account/account.entity';
import { RoleService, ROOT_ROLE_ID } from 'src/roles/role.service';
import { User } from 'src/users/user.entity';
import { DeleteResult, FindManyOptions } from 'typeorm';
import { Invite, InviteDTO } from './invite.entity';
import { InviteRepository } from './invite.repository';

@Injectable()
export class InviteService extends RestService<Invite, InviteDTO, InviteRepository> {
    

    constructor(
        private inviteRepository: InviteRepository,
        private roleService: RoleService
    ){
        super(inviteRepository)
    }

    public async findAll(pageable: Pageable, options?: FindManyOptions<Invite>): Promise<Page<Invite>> {
        return this.inviteRepository.findAll(pageable, options);
    }

    public async findById(inviteId: string, options?: FindManyOptions<Invite>): Promise<Invite> {
        return this.inviteRepository.findById(inviteId, options)
    }

    public async findByRoleId(roleId: string): Promise<Invite> {
        return this.inviteRepository.findOne({ asignRole: { id: roleId }})
    }

    public async getInvite(inviteId: string): Promise<Invite> {
        return this.inviteRepository.findOne({ where: { id: inviteId }, relations: ["role", "user"]})
    }

    public async create(data: InviteDTO, account?: Account): Promise<Invite> {
        const validator = new Validator();
        const invite = new Invite();

        if(validator.number("maxUses", data.maxUses).min(1).max(120).check()) {
            invite.maxUses = data.maxUses;
        }

        if(validator.date("expiresAt", data.expiresAt?.toString()).after(new Date()).check()) {
            invite.expiresAt = data.expiresAt;
        }

        validator.throwErrors();
        invite.asignRole = data.asignRole;
        invite.inviter = account as User;
        return await this.inviteRepository.save(invite);
    }

    public async update(): Promise<Invite> {
        return;
    }

    public async delete(id: string): Promise<DeleteResult> {
        return this.inviteRepository.delete({ id });
    }

    public async createDefaultInvite() {
        const rootRole = await this.roleService.findRootRole();

        if(!await this.findByRoleId(ROOT_ROLE_ID)) {
            await this.create({
                asignRole: rootRole,
                maxUses: 1
            })
        }
    }

    public async save(invite: Invite): Promise<Invite> {
        return this.inviteRepository.save(invite)
    }

    /**
     * Check if an invite is still valid.
     * @param invite Invite data to check
     * @returns True or False
     */
     public isInviteValid(invite: Invite): boolean {
        return invite.uses < invite.maxUses || (invite.expiresAt && invite.expiresAt.getTime() <= Date.now())
    }

}
