import { Module } from '@nestjs/common';
import { RolesController } from './role.controller';
import { PermissionService } from './permission.service';
import { RoleService } from './role.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionRepository } from './permission.repository';
import { RoleRepository } from './role.repository';
import { ServiceModule } from '../services/service.module';
import { PermissionController } from './permission.controller';

@Module({
  controllers: [RolesController, PermissionController],
  imports: [
    ServiceModule,
    TypeOrmModule.forFeature([ PermissionRepository, RoleRepository ])
  ],
  providers: [PermissionService, RoleService],
  exports: [
    RoleService
  ]
})
export class RolesModule {}
