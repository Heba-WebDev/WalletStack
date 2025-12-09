import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from '@shared/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
      stopAtFirstError: false,
      enableDebugMessages: false,
    }),
  );

  app.useGlobalInterceptors(new ResponseInterceptor());

  app.setGlobalPrefix('v1', {
    exclude: ['/', 'docs'],
  });

  const config = new DocumentBuilder()
    .setTitle('WalletStack API Documentation')
    .setDescription('WalletStack Backend API Documentation')
    .setVersion('1.0')
    .addTag('Auth')
    .addTag('Users')
    .addTag('Wallets')
    .addTag('API Keys')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, swaggerDocument, {
    swaggerOptions: {
      persistAuthorization: true,
      persistAuthorizationInLocalStorage: true,
    },
    customSiteTitle: 'WalletStack API Docs',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`Application is running on port ${port}`);
  logger.log(`Swagger documentation available at http://localhost:${port}/docs`);
}

bootstrap();

