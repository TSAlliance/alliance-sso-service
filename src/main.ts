import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import io from "@pm2/io"
import { ApiExceptionFilter, ResponseInterceptor } from '@tsalliance/rest';
import { ValidationPipe } from '@nestjs/common';

const portMetric = io.metric({
  id: "app/port",
  name: "Application Port"
})

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: "*"
    }
  });

  app.useGlobalFilters(new ApiExceptionFilter({ debug: false }));
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalPipes(new ValidationPipe())
  
  const swaggerConfig = new DocumentBuilder();
  swaggerConfig.setTitle("Alliance SSO Docs");
  swaggerConfig.setDescription("Documentation for the TSAlliance Single-Sign-On service.");
  swaggerConfig.setVersion("1.0");
  swaggerConfig.addBearerAuth();
  
  const document = SwaggerModule.createDocument(app, swaggerConfig.build());
  SwaggerModule.setup("docs", app, document);

  const port = process.env.APP_PORT || 3000;
  portMetric.set(port.toString())

  await app.listen(port);
}

bootstrap();