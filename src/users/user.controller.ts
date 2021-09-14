import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { ApiQuery, ApiTags } from "@nestjs/swagger";
import { Filter, Pageable } from "nestjs-pager";
import { Permission } from "src/roles/permission.decorator";
import { User, UserDTO } from "./user.entity";
import { UserService } from "./user.service";

@ApiTags("User Controller")
@Controller('users')
export class UsersController {

    constructor(private userService: UserService){}

    @Get()
    @Permission("users.read")
    @ApiQuery({ name: "select", required: false, isArray: true, type: "string" })
    public async findAll(@Pageable() pageable: Pageable, @Filter(User) filter: Filter) {
        return this.userService.findAll(pageable, { select: filter.select as (keyof User)[], relations: filter.relations });
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
