import { Injectable } from '@nestjs/common';
import { Validator } from '@tsalliance/rest';
import { Page, Pageable } from 'nestjs-pager';
import { DeleteResult, FindManyOptions } from 'typeorm';
import { Invite, InviteDTO } from './invite.entity';
import { InviteRepository } from './invite.repository';

@Injectable()
export class InviteService {

    constructor(
        private inviteRepository: InviteRepository,
        private validator: Validator
    ){}

    public async findAll(pageable: Pageable, options?: FindManyOptions<Invite>): Promise<Page<Invite>> {
        return this.inviteRepository.findAll(pageable, options);
    }

    public async findById(roleId: string): Promise<Invite> {
        return this.inviteRepository.findOne({ id: roleId })
    }

    public async createInvite(data: InviteDTO): Promise<Invite> {
        const invite = new Invite();

        console.log(this.validator.date("expiresAt", data.expiresAt.toString()).check())

        if(data.maxUses && this.validator.number("maxUses", data.maxUses).min(1).max(120).check()) {
            invite.maxUses = data.maxUses;
        }
        

        /*this.validator.text("title", data.title).alphaNum().minLen(3).maxLen(32).required().check();
        if(data.description && this.validator.text("description", data.description).alphaNum().minLen(3).maxLen(120).check()) {
            role.description = data.description;
        }
        
        this.validator.throwErrors();

        role.title = data.title;
        if(data.permissions) role.permissions = data.permissions;*/
        return this.inviteRepository.save(invite);
    }

    public async deleteInvite(id: string): Promise<DeleteResult> {
        return this.inviteRepository.delete({ id });
    }

}
