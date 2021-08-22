import { Module } from '@nestjs/common';
import { ServiceService } from './service.service';
import { ServiceController } from './service.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceRepository } from './service.repository';
import { Validator } from '@tsalliance/rest';

@Module({
  providers: [ServiceService, Validator],
  controllers: [ServiceController],
  imports: [
    TypeOrmModule.forFeature([ ServiceRepository ])
  ],
  exports: [
    ServiceService
  ]
})
export class ServiceModule {}
