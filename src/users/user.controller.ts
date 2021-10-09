import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { ApiQuery, ApiTags } from "@nestjs/swagger";
import { Permission } from "@tsalliance/rest";
import { Pageable } from "nestjs-pager";
import { PermissionCatalog } from "src/permission/permission.registry";
import { UserDTO } from "./user.entity";
import { UserService } from "./user.service";

@ApiTags("User Controller")
@Controller('users')
export class UsersController {

    constructor(private userService: UserService){}

    @Get()
    @Permission(PermissionCatalog.USERS_READ)
    @ApiQuery({ name: "select", required: false, isArray: true, type: "string" })
    public async findAll(@Pageable() pageable: Pageable) {
        return this.userService.findAll(pageable);
    }

    @Get(":userId")
    @Permission(PermissionCatalog.USERS_READ)
    public async findById(@Param("userId") userId: string) {
        return this.userService.findById(userId)
    }

    @Post()
    @Permission(PermissionCatalog.USERS_WRITE)
    public async createUser(@Body() user: UserDTO) {
        return this.userService.create(user);
    }

    @Put(":userId")
    @Permission(PermissionCatalog.USERS_WRITE)
    public async updateUser(@Param("userId") userId: string, @Body() user: UserDTO) {
        return this.userService.update(userId, user);
    }

    @Delete(":userId")
    @Permission(PermissionCatalog.USERS_WRITE)
    public async deleteUser(@Param("userId") userId: string) {
        return this.userService.delete(userId)
    }


}
