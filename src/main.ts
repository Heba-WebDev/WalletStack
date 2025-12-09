import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from '@shared/interceptors/response.interceptor';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false, // Disable default body parser
  });
  const logger = new Logger('Bootstrap');

  // Custom body parser that preserves raw body for webhook
  app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.path === '/v1/wallet/paystack/webhook' || req.path === '/wallet/paystack/webhook') {
      // For webhook, preserve raw body
      let data = '';
      req.setEncoding('utf8');
      req.on('data', (chunk: string) => {
        data += chunk;
      });
      req.on('end', () => {
        (req as any).rawBody = data;
        try {
          req.body = JSON.parse(data);
        } catch (e) {
          req.body = {};
        }
        next();
      });
    } else {
      // For other routes, use JSON parser
      express.json()(req, res, next);
    }
  });

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

