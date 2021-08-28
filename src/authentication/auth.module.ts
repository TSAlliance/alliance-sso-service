import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ServiceModule } from '../services/service.module';
import { UsersModule } from 'src/users/user.module';

@Module({
  providers: [AuthService],
  controllers: [AuthController],
  imports: [
    ServiceModule,
    JwtModule.register({
      secret: "TODO_secret"
    }),
    UsersModule
  ]
})
export class AuthModule {}
