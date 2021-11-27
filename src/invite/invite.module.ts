import { Module } from '@nestjs/common';
import { InviteService } from './invite.service';
import { InviteController } from './invite.controller';
import { RolesModule } from 'src/roles/role.module';
import { UsersModule } from 'src/users/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InviteRepository } from './invite.repository';

@Module({
  controllers: [InviteController],
  providers: [InviteService],
  imports: [
    RolesModule,
    UsersModule,
    TypeOrmModule.forFeature([InviteRepository])
  ],
  exports: [
    InviteService
  ]
})
export class InviteModule {}
