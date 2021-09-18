import { Module } from '@nestjs/common';
import { RolesController } from './role.controller';
import { RoleService } from './role.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleRepository } from './role.repository';
import { ServiceModule } from '../services/service.module';
import { PermissionController } from '../permission/permission.controller';
import { PermissionRepository } from 'src/permission/permission.repository';
import { PermissionService } from 'src/permission/permission.service';

@Module({
  controllers: [RolesController, PermissionController],
  imports: [
    ServiceModule,
    TypeOrmModule.forFeature([ PermissionRepository, RoleRepository ])
  ],
  providers: [PermissionService, RoleService],
  exports: [
    RoleService,
    PermissionService
  ]
})
export class RolesModule {}
