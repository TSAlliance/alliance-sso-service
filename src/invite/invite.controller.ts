import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiBasicAuth, ApiTags } from '@nestjs/swagger';
import { Authentication, Permission } from '@tsalliance/rest';
import { Page, Pageable } from 'nestjs-pager';
import { Account } from 'src/account/account.entity';
import { PermissionCatalog } from 'src/permission/permission.registry';
import { DeleteResult } from 'typeorm';
import { Invite, InviteDTO } from './invite.entity';
import { InviteService } from './invite.service';

@ApiTags("Invite Controller")
@Controller('invites')
export class InviteController {

    constructor(private inviteService: InviteService){}

    @Post()
    @ApiBasicAuth()
    @Permission(PermissionCatalog.INVITES_WRITE)
    public async createInvite(@Body() data: InviteDTO, @Authentication() account: Account) {
        return this.inviteService.create(data, account);
    }

    @Get()
    @ApiBasicAuth()
    @Permission(PermissionCatalog.INVITES_READ)
    public async findAll(@Pageable() pageable: Pageable): Promise<Page<Invite>> {
        return this.inviteService.findAll(pageable, {  })
    }

    @Get(":inviteId")
    public async findById(@Param("inviteId") inviteId: string): Promise<Invite> {
        return this.inviteService.findById(inviteId)
    }

    @Delete(":inviteId")
    @ApiBasicAuth()
    @Permission(PermissionCatalog.INVITES_WRITE)
    public async delete(@Param("inviteId") inviteId: string): Promise<DeleteResult> {
        return this.inviteService.delete(inviteId)
    }

}
