import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { InviteService } from './invite.service';
import { CreateInviteDto } from './dto/create-invite.dto';
import { UpdateInviteDto } from './dto/update-invite.dto';
import { Page, Pageable } from 'nestjs-pager';
import { Invite } from './entities/invite.entity';

import { Authentication, CanAccess, RestAccount } from "@tsalliance/rest"
import { PermissionCatalog } from 'src/permission/permission.registry';

@Controller('invites')
export class InviteController {
    constructor(private readonly inviteService: InviteService) {}

    @Get()
    @CanAccess([PermissionCatalog.INVITES_READ, PermissionCatalog.INVITES_WRITE])
    public async findAll(@Pageable() pageable: Pageable): Promise <Page<Invite>> {
        return this.inviteService.findAll(pageable)
    }

    @Post()
    @CanAccess(PermissionCatalog.INVITES_WRITE)
    public create(@Body() createInviteDto: CreateInviteDto, @Authentication() authentication: RestAccount) {
        return this.inviteService.create(createInviteDto, authentication);
    }

    @Get(':id')
    public findOne(@Param('id') id: string) {
        return this.inviteService.findById(id);
    }

    @Put(':id')
    @CanAccess(PermissionCatalog.INVITES_WRITE)
    public update(@Param('id') id: string, @Body() updateInviteDto: UpdateInviteDto) {
        return this.inviteService.update(id, updateInviteDto);
    }

    @Delete(':id')
    @CanAccess(PermissionCatalog.INVITES_WRITE)
    public remove(@Param('id') id: string) {
        return this.inviteService.delete(id);
    }
}
