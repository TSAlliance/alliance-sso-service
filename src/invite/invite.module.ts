import { Module } from '@nestjs/common';
import { InviteService } from './invite.service';
import { InviteController } from './invite.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InviteRepository } from './invite.repository';
import { RolesModule } from 'src/roles/role.module';

@Module({
  providers: [InviteService],
  controllers: [InviteController],
  imports: [
    RolesModule,
    TypeOrmModule.forFeature([ InviteRepository ])
  ],
  exports: [
    InviteService
  ]
})
export class InviteModule {}
