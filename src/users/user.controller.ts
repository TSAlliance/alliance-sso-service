import { Body, Controller, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { UserDTO } from "./user.entity";
import { UserService } from "./user.service";

@ApiTags("User Controller")
@Controller('users')
export class UsersController {

    constructor(private userService: UserService){}

    @Post()
    public async createUser(@Body() user: UserDTO) {
        return this.userService.createUser(user);
    }


}
