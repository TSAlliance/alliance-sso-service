import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { UserService } from 'src/users/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from 'src/users/user.repository';
import { PasswordService } from 'src/authentication/password.service';

@Module({
  providers: [MediaService, UserService, PasswordService],
  imports: [
    TypeOrmModule.forFeature([ UserRepository ])
  ],
  exports: [
      MediaService
  ],
  controllers: [MediaController]
})
export class MediaModule {}
