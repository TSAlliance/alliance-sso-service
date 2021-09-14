import { forwardRef, Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from 'src/users/user.repository';
import { PasswordService } from 'src/authentication/password.service';
import { UsersModule } from 'src/users/user.module';

@Module({
  providers: [MediaService, PasswordService],
  imports: [
    forwardRef(() => UsersModule),
    TypeOrmModule.forFeature([ UserRepository ])
  ],
  exports: [
      MediaService
  ],
  controllers: [MediaController]
})
export class MediaModule {}
