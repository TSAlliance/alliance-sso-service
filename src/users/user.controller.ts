import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Pageable } from "nestjs-pager";
import { Permission } from "src/roles/permission.decorator";
import { UserDTO } from "./user.entity";
import { UserService } from "./user.service";

@ApiTags("User Controller")
@Controller('users')
export class UsersController {

    constructor(private userService: UserService){}

    @Get()
    @Permission("users.read")
    public async findAll(@Pageable() pageable: Pageable) {
        return this.userService.findAll(pageable);
    }

    @Get(":userId")
    @Permission("users.read")
    public async findById(@Param("userId") userId: string) {
        return this.userService.findById(userId)
    }

    @Post()
    // @Permission("users.write")
    public async createUser(@Body() user: UserDTO) {
        return this.userService.createUser(user);
    }

    @Put()
    @Permission("users.write")
    public async updateUser(@Body() user: UserDTO) {
        return this.userService.createUser(user);
    }

    @Delete(":userId")
    @Permission("users.write")
    public async deleteUser(@Param("userId") userId: string) {
        return this.userService.deleteUser(userId)
    }


}
