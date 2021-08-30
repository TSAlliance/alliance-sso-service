import { Module } from '@nestjs/common';
import { InviteService } from './invite.service';
import { InviteController } from './invite.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InviteRepository } from './invite.repository';

@Module({
  providers: [InviteService],
  controllers: [InviteController],
  imports: [
    TypeOrmModule.forFeature([ InviteRepository ])
  ]
})
export class InviteModule {}
