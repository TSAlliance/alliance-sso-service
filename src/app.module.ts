import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ValidatorModule } from '@tsalliance/rest';
import { ServiceModule } from './services/service.module';
import { RolesModule } from './roles/role.module';
import { UsersModule } from './users/user.module';
import { MediaModule } from './media/media.module';
import { AuthModule } from './authentication/auth.module';

@Module({
  imports: [
    ValidatorModule,
    ServiceModule,
    RolesModule,
    UsersModule,
    MediaModule,
    AuthModule,
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
    }), 
  ],
  controllers: [],
})
export class AppModule {}
