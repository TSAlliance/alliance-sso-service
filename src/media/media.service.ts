import { createAvatar } from '@dicebear/avatars';
import { forwardRef, Inject, Injectable, InternalServerErrorException, NotFoundException, StreamableFile, UnsupportedMediaTypeException } from '@nestjs/common';
import { createReadStream, existsSync, mkdirSync, readdirSync, unlinkSync } from 'fs';

import * as defaultAvatarStyles from '@dicebear/avatars-jdenticon-sprites';
import { RandomUtil } from '@tsalliance/rest';
import sharp, { OutputInfo } from 'sharp';
import { UserService } from 'src/users/user.service';
import { User } from 'src/users/user.entity';

@Injectable()
export class MediaService {

    private AVATAR_MIMETYPES = [ "image/png", "image/jpg", "image/jpeg"]
    private AVATAR_UPLOAD_DIR = "./uploads/avatars/"

    constructor(@Inject(forwardRef(() => UserService)) private userService: UserService) {
        mkdirSync(this.AVATAR_UPLOAD_DIR, { recursive: true });
    }

    /**
     * Process uploaded multer file as avatar of user
     * @param userId User's id.
     * @param file Multer file object.
     */
    public async uploadAvatar(userId: string, file: Express.Multer.File): Promise<void> {
        if(!this.AVATAR_MIMETYPES.includes(file.mimetype.toLowerCase())) {
            throw new UnsupportedMediaTypeException();
        }

        await this.setUserAvatar(userId, file.buffer);     
    }

    /**
     * Serve an avatar by returning a streamable file for cross platform support in nest.
     * @param resourceHash Hash to identify the resource with
     * @returns StreamableFile object
     */
    public async serveAvatar(resourceHash: string): Promise<StreamableFile> {
        const filepath = this.AVATAR_UPLOAD_DIR + resourceHash + ".jpeg";
        if(!existsSync(filepath)) throw new NotFoundException()

        return new StreamableFile(createReadStream(this.AVATAR_UPLOAD_DIR + resourceHash + ".jpeg"));
    }

    /**
     * Set string encoded image or buffered image as new avatar of user.
     * @param userId User's id.
     * @param data Image encoded as string or buffer.
     * @returns Promise containing resource hash and resource uri for the avatar
     */
    public async setUserAvatar(userId: string, data: string | Buffer): Promise<{ resourceId: string, resourceUri: string }> {
        const user: User = await this.userService.findById(userId);
        if(!user) throw new NotFoundException();

        const previousAvatarFile: string = this.AVATAR_UPLOAD_DIR + user.avatarResourceId + ".jpeg";

        const resourceHash: string = this.generateResourceHash(this.AVATAR_UPLOAD_DIR, ".jpeg");
        const destFilename: string = resourceHash + ".jpeg";
        const destFilepath: string = this.AVATAR_UPLOAD_DIR + destFilename;        

        user.avatarResourceId = resourceHash;
        user.avatarResourceUri = "alliance:avatars:" + userId + ":" + resourceHash;

        await this.saveOptimizedImage(destFilepath, data, "jpeg", { 
            width: 512, 
            height: 512, 
            options: { 
                fit: "cover", 
                background: { r: 61, g: 69, b: 80, alpha: 1 }
            }
        }).catch((error) => {
            throw new InternalServerErrorException(error);
        });

        await this.userService.save(user).then(() => {
            // Success saving everything -> Delete old avatar file
            if(existsSync(previousAvatarFile)) unlinkSync(previousAvatarFile);
        }).catch((error) => {
            // Failure saving in database, delete newly created file
            unlinkSync(destFilepath);
            throw new InternalServerErrorException(error);
        });

        return {
            resourceId: resourceHash,
            resourceUri: user.avatarResourceUri
        }
    }

    /**
     * Save optimized image data.
     * @param destFilePath Destination file path
     * @param data Image data encoded as string or buffer
     * @param format Specify the output format of the image file. (Optional)
     * @param resize Options for resizing the image. (Optional)
     * @returns Sharp OutputInfo object
     */
    public async saveOptimizedImage(destFilePath: string, data: string | Buffer, format?: keyof sharp.FormatEnum | sharp.AvailableFormatInfo, resize?: { width?: number, height?: number, options?: sharp.ResizeOptions }): Promise<OutputInfo> {
        if(!Buffer.isBuffer(data)) data = Buffer.from(data);
        let sharpInstance = sharp(data);

        // Optimize quality for jpegs
        if(format) {
            if(format == "jpeg") {
                sharpInstance = sharpInstance.jpeg({ quality: 95 })
            } else {
                sharpInstance = sharpInstance.toFormat(format);
            }
        }
        if(resize) sharpInstance = sharpInstance.resize(resize.width, resize.height, resize.options);

        return sharpInstance.toFile(destFilePath)
    }

    /**
     * Generate unique resource hash. If hash exists on disk
     * @param destDirPath Directory path of the destination.
     * @param fileExt Extension of the destination file
     * @returns Resource hash as string
     */
    public generateResourceHash(destDirPath: string, fileExt: string): string {
        const files: string[] = readdirSync(destDirPath);
        let hash: string;

        do {
            hash = RandomUtil.randomString(16);
        } while(files.includes(hash + fileExt));

        return RandomUtil.randomString(16);
    }

    /**
     * Generate a default avatar for users using the dicebear library.
     * @param seed Seed to generate random pattern.
     * @param options Options like height and width.
     * @returns SVG as string
     */
    public generateAvatar(seed: string): string {
        return createAvatar(defaultAvatarStyles, {
            width: 256,
            height: 256,
            seed,
            backgroundColor: "#3d4550"
        })
    }

}
