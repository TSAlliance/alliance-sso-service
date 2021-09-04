import { Body, Controller, Delete, Get, Param, Post, Put, Request } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Pageable } from "nestjs-pager";
import { Permission } from "src/roles/permission.decorator";
import { UserDTO } from "./user.entity";
import { UserService } from "./user.service";

@ApiTags("User Controller")
@Controller('users')
export class UsersController {

    constructor(private userService: UserService){}

    @Get()
    @ApiBearerAuth()
    @Permission("users.read")
    public async findAll(@Pageable() pageable: Pageable, @Request() request: Request) {
        console.log(request["account"])
        return this.userService.findAll(pageable);
    }

    @Get(":userId")
    @ApiBearerAuth()
    @Permission("users.read")
    public async findById(@Param("userId") userId: string) {
        return this.userService.findById(userId)
    }

    @Post()
    @ApiBearerAuth()
    // @Permission("users.write")
    public async createUser(@Body() user: UserDTO) {
        return this.userService.createUser(user);
    }

    @Put()
    @ApiBearerAuth()
    @Permission("users.write")
    public async updateUser(@Body() user: UserDTO) {
        return this.userService.createUser(user);
    }

    @Delete(":userId")
    @ApiBearerAuth()
    @Permission("users.write")
    public async deleteUser(@Param("userId") userId: string) {
        return this.userService.deleteUser(userId)
    }


}
