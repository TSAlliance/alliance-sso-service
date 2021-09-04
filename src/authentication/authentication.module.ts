import { Module } from '@nestjs/common';
import { AuthService } from './authentication.service';
import { AuthController } from './authentication.controller';
import { JwtModule } from '@nestjs/jwt';
import { ServiceModule } from '../services/service.module';
import { UsersModule } from 'src/users/user.module';
import { PasswordService } from './password.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecoveryTokenRepository } from './authentication.repository';
import { APP_GUARD } from '@nestjs/core';
import { AuthenticationGuard } from './authentication.guard';
import { InviteModule } from 'src/invite/invite.module';

@Module({
  imports: [
    ServiceModule,
    JwtModule.register({
      secret: "TODO_secret"
    }),
    UsersModule,
    InviteModule,
    TypeOrmModule.forFeature([ RecoveryTokenRepository ])
  ],
  providers: [AuthService, PasswordService, { provide: APP_GUARD, useClass: AuthenticationGuard }],
  controllers: [AuthController],
  exports: [
    PasswordService,
    AuthService
  ]
})
export class AuthModule {}
