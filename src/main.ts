import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ApiExceptionFilter } from "@tsalliance/rest"
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new ApiExceptionFilter({ debug: false }));
  
  const swaggerConfig = new DocumentBuilder();
  swaggerConfig.setTitle("Alliance SSO Docs");
  swaggerConfig.setDescription("Documentation for the TSAlliance Single-Sign-On service.");
  swaggerConfig.setVersion("1.0");
  swaggerConfig.addBearerAuth();
  
  const document = SwaggerModule.createDocument(app, swaggerConfig.build());
  SwaggerModule.setup("docs", app, document);

  await app.listen(3000);
}

bootstrap();
