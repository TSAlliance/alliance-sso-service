import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ValidatorModule } from '@tsalliance/rest';
import { ServiceModule } from './services/service.module';
import { RolesModule } from './roles/role.module';
import { UsersModule } from './users/user.module';
import { MediaModule } from './media/media.module';
import { AuthModule } from './authentication/authentication.module';
import { InviteModule } from './invite/invite.module';
import { ProfileModule } from './profile/profile.module';
import { InviteService } from './invite/invite.service';
import { RoleService } from './roles/role.service';
import { ServiceService } from './services/service.service';
import { PermissionService } from './permission/permission.service';
import { MailModule } from './mail/mail.module';
import { SubscriberModule } from './events/subscriber.module';
import { MailerModule } from '@nestjs-modules/mailer';
import path from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

const isDev = process.env.NODE_ENV && process.env.NODE_ENV !== 'production';
const envFile = ".env" + (isDev ? "." + process.env.NODE_ENV : "")

@Module({
  imports: [
    ValidatorModule,
    ServiceModule,
    RolesModule,
    UsersModule,
    MediaModule,
    AuthModule,
    InviteModule, 
    ProfileModule, 
    MailModule,
    ConfigModule.forRoot(
      {
        isGlobal: true, 
        envFilePath: envFile
      }
    ),  // Load .env file for configuration
    TypeOrmModule.forRoot({
      type: "mysql",
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      entities: [
        ...[(isDev ? "dist/**/*.entity{ .ts,.js}" : "**/*.entity{ .ts,.js}")]
      ],
      synchronize: true,
      entityPrefix: process.env.DB_PREFIX,
      retryAttempts: Number.MAX_VALUE,
      retryDelay: 10000,
      subscribers: [
        ...[(isDev ? "dist/**/*.subscriber{ .ts,.js}" : "**/*.subscriber{ .ts,.js}")]
      ]
    }),
    MailerModule.forRoot({
      transport: {
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT),
          secure: false,
          auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
          }
      },
      defaults: {
          from: "TSAlliance <" + process.env.SMTP_USER + ">"
      },
      template: {
          dir: path.resolve(__dirname, "mail/templates"),
          adapter: new HandlebarsAdapter(),
          options: {
              strict: false,
          }
      }
    }),
    SubscriberModule
  ],
  controllers: [],
})
export class AppModule implements OnModuleInit {

  constructor(
    private serviceService: ServiceService,
    private roleService: RoleService,
    private permissionService: PermissionService,
    private inviteService: InviteService,
  ){}
  
  public async onModuleInit(): Promise<void> {
    await this.serviceService.createRootService();
    await this.roleService.createRootRole();
    await this.permissionService.createRootPermission();
    await this.permissionService.createDefaultPermissions();
    await this.inviteService.createDefaultInvite();
  }

}
