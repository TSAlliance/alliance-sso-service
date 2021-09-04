import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PasswordService } from 'src/authentication/password.service';
import { MediaService } from 'src/media/media.service';
import { RolesModule } from 'src/roles/role.module';
import { UsersController } from './user.controller';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';

@Module({
  controllers: [UsersController],
  providers: [UserService, MediaService, PasswordService],
  imports: [
    RolesModule,
    TypeOrmModule.forFeature([ UserRepository ]),
  ],
  exports: [
    UserService,
    TypeOrmModule
  ]
})
export class UsersModule {}
