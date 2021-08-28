import { BadRequestException, Controller, Get, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AvatarUploadDTO } from './media.entity';
import { MediaService } from './media.service';

@ApiTags("Media Controller")
@Controller('media')
export class MediaController {

    constructor(
        private mediaService: MediaService
    ){}

    @Post("avatars/:userId")
    @UseInterceptors(FileInterceptor("avatar"))
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        description: 'List of cats',
        type: AvatarUploadDTO,
    })
    public async uploadUserAvatar(@Param("userId") userId: string, @UploadedFile() file: Express.Multer.File) {
        if(!file) throw new BadRequestException();
        return this.mediaService.uploadAvatar(userId, file);
    }

    @Get("avatars/:resourceHash")
    public async serveAvatar(@Param("resourceHash") resourceHash: string) {
        return this.mediaService.serveAvatar(resourceHash)
    }

}
