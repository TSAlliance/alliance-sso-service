import { Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { AuthenticationController } from './authentication.controller';
import { PasswordService } from './password.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GrantCodeRepository } from './repositories/grantCode.repository';
import { RecoveryTokenRepository } from './repositories/recoveryToken.repository';
import { UsersModule } from 'src/users/user.module';
import { MailModule } from 'src/mail/mail.module';
import { InviteModule } from 'src/invite/invite.module';
import { ServiceModule } from 'src/services/service.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [AuthenticationController],
  providers: [AuthenticationService, PasswordService],
  exports: [AuthenticationService, PasswordService],
  imports: [
    UsersModule,
    MailModule,
    InviteModule,
    ServiceModule,
    TypeOrmModule.forFeature([ GrantCodeRepository, RecoveryTokenRepository ]),
    JwtModule.register({
      secret: "TODO_secret"
    })
  ]
})
export class AuthenticationModule {}
