import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthCodeRepository } from './auth.repository';
import { UsersModule } from 'src/users/user.module';
import { AccountModule } from 'src/account/account.module';

@Module({
  providers: [AuthService],
  controllers: [AuthController],
  imports: [
    AccountModule,
    JwtModule.register({
      secret: "TODO_secret"
    }),
    TypeOrmModule.forFeature([ AuthCodeRepository ]),
    UsersModule
  ]
})
export class AuthModule {}
