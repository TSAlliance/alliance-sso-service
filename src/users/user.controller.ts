import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { ApiQuery, ApiTags } from "@nestjs/swagger";
import { Pageable } from "nestjs-pager";
import { Permission } from "src/roles/permission.decorator";
import { PermissionCatalog } from "src/roles/permission.registry";
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
        return this.userService.createUser(user);
    }

    @Put()
    @Permission(PermissionCatalog.USERS_WRITE)
    public async updateUser(@Body() user: UserDTO) {
        return this.userService.createUser(user);
    }

    @Delete(":userId")
    @Permission(PermissionCatalog.USERS_WRITE)
    public async deleteUser(@Param("userId") userId: string) {
        return this.userService.deleteUser(userId)
    }


}
