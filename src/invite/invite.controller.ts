import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiBasicAuth, ApiTags } from '@nestjs/swagger';
import { Page, Pageable } from 'nestjs-pager';
import { Permission } from 'src/roles/permission.decorator';
import { DeleteResult } from 'typeorm';
import { Invite, InviteDTO } from './invite.entity';
import { InviteService } from './invite.service';

@ApiTags("Invite Controller")
@Controller('invite')
export class InviteController {

    constructor(private inviteService: InviteService){}

    @Post()
    @ApiBasicAuth()
    @Permission("invite.write")
    public async createInvite(@Body() data: InviteDTO) {
        return this.inviteService.createInvite(data);
    }

    @Get()
    @ApiBasicAuth()
    @Permission("invite.read")
    public async findAll(@Pageable() pageable: Pageable): Promise<Page<Invite>> {
        return this.inviteService.findAll(pageable, { relations: ["role", "user"] })
    }

    @Get(":inviteId")
    public async findById(@Param("inviteId") inviteId: string): Promise<Invite> {
        return this.inviteService.findById(inviteId)
    }

    @Delete(":inviteId")
    @ApiBasicAuth()
    @Permission("invite.write")
    public async delete(@Param("inviteId") inviteId: string): Promise<DeleteResult> {
        return this.inviteService.deleteInvite(inviteId)
    }

}
