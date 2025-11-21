import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://localhost:3000', 'http://192.168.100.10:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });

  app.use(
    '/stripe/webhook',
    express.raw({ type: 'application/json' }),
  );


  // Swagger
  const config = new DocumentBuilder()
    .setTitle('API de LitHub')
    .setDescription('Documentación de la API construida con NestJS y Swagger')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3003, '0.0.0.0');
}
bootstrap();
