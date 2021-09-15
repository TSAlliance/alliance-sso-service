import { BadRequestException, Controller, Get, Header, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { RequireAuth } from 'src/authentication/authentication.decorator';
import { Permission } from 'src/roles/permission.decorator';
import { AvatarUploadDTO } from './media.entity';
import { MediaService } from './media.service';

@ApiTags("Media Controller")
@Controller('media')
export class MediaController {

    constructor(
        private mediaService: MediaService
    ){}

    @Post("avatars")
    @UseInterceptors(FileInterceptor("avatar"))
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        description: 'Avatar file',
        type: AvatarUploadDTO
    })
    @RequireAuth() // Only authentication
    public async uploadUserAvatar(@Param("userId") userId: string, @UploadedFile() file: Express.Multer.File) {
        if(!file) throw new BadRequestException();
        return this.mediaService.uploadAvatar(userId, file);
    }

    @Get("avatars/:resourceHash")
    @Header("Content-Type", "image/jpeg")
    public async serveAvatar(@Param("resourceHash") resourceHash: string) {
        return this.mediaService.serveAvatar(resourceHash)
    }

}
