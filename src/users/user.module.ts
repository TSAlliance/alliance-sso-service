import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Validator } from '@tsalliance/rest';
import { UsersController } from './user.controller';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';

@Module({
  controllers: [UsersController],
  providers: [UserService, Validator],
  imports: [
    TypeOrmModule.forFeature([ UserRepository ]),
  ],
  exports: [
    UserService
  ]
})
export class UsersModule {}
