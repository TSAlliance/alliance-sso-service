import { Module } from '@nestjs/common';
import { UsersModule } from './users/user.module';
import { RolesModule } from './roles/roles.module';
import { AuthModule } from './auth/auth.module';
import { AccountModule } from './account/account.module';
import { ServiceModule } from './service/service.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Validator } from '@tsalliance/rest';

@Module({
  imports: [
    UsersModule, 
    RolesModule, 
    AuthModule, 
    AccountModule, 
    ServiceModule,
    ConfigModule.forRoot({isGlobal: true, envFilePath: [".dev.env", ".prod.env", "*.env"]}),  // Load .env file for configuration
    TypeOrmModule.forRoot({
      type: "mysql",
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      entities: [
        "dist/**/*.entity{ .ts,.js}",
      ],
      synchronize: true,
      entityPrefix: process.env.DB_PREFIX,
      retryAttempts: Number.MAX_VALUE,
      retryDelay: 10000
    })
  ],
  controllers: [],
  providers: [Validator],
})
export class AppModule {}
