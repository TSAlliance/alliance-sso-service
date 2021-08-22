import { Module } from '@nestjs/common';
import { RolesController } from './roles.controller';
import { PermissionService } from './permission.service';
import { RolesService } from './roles.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionRepository } from './permission.repository';
import { ServiceModule } from 'src/service/service.module';

@Module({
  controllers: [RolesController],
  imports: [
    ServiceModule,
    TypeOrmModule.forFeature([ PermissionRepository ])
  ],
  providers: [PermissionService, RolesService]
})
export class RolesModule {}
