import { BadRequestException, Controller, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
export class UsersController {

    @Post(":userId/avatar")
    @UseInterceptors(FileInterceptor("avatar"))
    public async uploadAvatar(@Param("userId") userId: string, @UploadedFile() file: Express.Multer.File) {
        if(!file) throw new BadRequestException();
        console.log("Uploaded: " + file?.originalname);

        
    }

}
