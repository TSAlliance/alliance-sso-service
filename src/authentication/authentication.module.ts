import { Module } from '@nestjs/common';
import { AuthService } from './authentication.service';
import { AuthController } from './authentication.controller';
import { JwtModule } from '@nestjs/jwt';
import { ServiceModule } from '../services/service.module';
import { UsersModule } from 'src/users/user.module';
import { PasswordService } from './password.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecoveryTokenRepository } from './authentication.repository';

@Module({
  providers: [AuthService, PasswordService],
  controllers: [AuthController],
  imports: [
    ServiceModule,
    JwtModule.register({
      secret: "TODO_secret"
    }),
    UsersModule,
    TypeOrmModule.forFeature([ RecoveryTokenRepository ])
  ],
  exports: [
    PasswordService
  ]
})
export class AuthModule {}
