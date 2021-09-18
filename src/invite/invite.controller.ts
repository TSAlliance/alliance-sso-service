import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiBasicAuth, ApiTags } from '@nestjs/swagger';
import { Page, Pageable } from 'nestjs-pager';
import { Permission } from 'src/permission/permission.decorator';
import { PermissionCatalog } from 'src/permission/permission.registry';
import { DeleteResult } from 'typeorm';
import { Invite, InviteDTO } from './invite.entity';
import { InviteService } from './invite.service';

@ApiTags("Invite Controller")
@Controller('invite')
export class InviteController {

    constructor(private inviteService: InviteService){}

    @Post()
    @ApiBasicAuth()
    @Permission(PermissionCatalog.INVITES_WRITE)
    public async createInvite(@Body() data: InviteDTO) {
        return this.inviteService.createInvite(data);
    }

    @Get()
    @ApiBasicAuth()
    @Permission(PermissionCatalog.INVITES_READ)
    public async findAll(@Pageable() pageable: Pageable): Promise<Page<Invite>> {
        return this.inviteService.findAll(pageable, { relations: ["role", "user"] })
    }

    @Get(":inviteId")
    public async findById(@Param("inviteId") inviteId: string): Promise<Invite> {
        // TODO: Show info based on permissions
        return this.inviteService.findById(inviteId)
    }

    @Delete(":inviteId")
    @ApiBasicAuth()
    @Permission(PermissionCatalog.INVITES_WRITE)
    public async delete(@Param("inviteId") inviteId: string): Promise<DeleteResult> {
        return this.inviteService.deleteInvite(inviteId)
    }

}
