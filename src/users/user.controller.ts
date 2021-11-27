import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { ApiQuery, ApiTags } from "@nestjs/swagger";
import { Authentication, CanAccess } from "@tsalliance/rest";
import { Pageable } from "nestjs-pager";
import { Account } from "src/account/account.entity";
import { PermissionCatalog } from "src/permission/permission.registry";
import { UserDTO } from "./user.entity";
import { UserService } from "./user.service";

@ApiTags("User Controller")
@Controller('users')
export class UsersController {

    constructor(private userService: UserService){}

    @Get()
    @CanAccess([PermissionCatalog.USERS_READ,PermissionCatalog.USERS_WRITE])
    @ApiQuery({ name: "select", required: false, isArray: true, type: "string" })
    public async findAll(@Pageable() pageable: Pageable) {
        return this.userService.findAll(pageable);
    }

    @Get(":userId")
    @CanAccess([PermissionCatalog.USERS_READ,PermissionCatalog.USERS_WRITE])
    public async findById(@Param("userId") userId: string) {
        return this.userService.findById(userId)
    }

    @Post()
    @CanAccess(PermissionCatalog.USERS_WRITE)
    public async createUser(@Body() user: UserDTO) {
        return this.userService.create(user);
    }

    @Put(":userId")
    @CanAccess(PermissionCatalog.USERS_WRITE)
    public async updateUser(@Param("userId") userId: string, @Body() user: UserDTO, @Authentication() account: Account) {
        return this.userService.update(userId, user, account);
    }

    @Delete(":userId")
    @CanAccess(PermissionCatalog.USERS_WRITE)
    public async deleteUser(@Param("userId") userId: string, @Authentication() account: Account) {
        return this.userService.delete(userId, account)
    }


}
