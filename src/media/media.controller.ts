import { BadRequestException, Controller, Get, Header, Param, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { IsAuthenticated } from '@tsalliance/rest';
import { Response } from 'express';
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
    @IsAuthenticated() // Only authentication
    public async uploadUserAvatar(@Param("userId") userId: string, @UploadedFile() file: Express.Multer.File) {
        if(!file) throw new BadRequestException();
        return this.mediaService.uploadAvatar(userId, file);
    }

    @Get("avatars/:resourceHash")
    @Header("Content-Type", "image/jpeg")
    public async serveAvatar(@Param("resourceHash") resourceHash: string, @Res() response: Response) {
        return this.mediaService.serveAvatar(resourceHash, response)
    }

}
