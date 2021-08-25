import { Module } from '@nestjs/common';
import { ServiceService } from './service.service';
import { ServiceController } from './service.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceRepository } from './service.repository';

@Module({
  providers: [ServiceService],
  controllers: [ServiceController],
  imports: [
    TypeOrmModule.forFeature([ ServiceRepository ])
  ],
  exports: [
    ServiceService
  ]
})
export class ServiceModule {}
