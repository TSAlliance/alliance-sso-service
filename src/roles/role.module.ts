import { Module } from '@nestjs/common';
import { RolesController } from './role.controller';
import { PermissionService } from './permission.service';
import { RolesService } from './role.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionRepository } from './permission.repository';
import { ServiceModule } from 'src/service/service.module';
import { RoleRepository } from './role.repository';

@Module({
  controllers: [RolesController],
  imports: [
    ServiceModule,
    TypeOrmModule.forFeature([ PermissionRepository, RoleRepository ])
  ],
  providers: [PermissionService, RolesService]
})
export class RolesModule {}
