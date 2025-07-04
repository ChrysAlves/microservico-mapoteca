// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('Microsserviço Mapoteca')
    .setDescription('API para gestão de pedidos de preservação digital.')
    .setVersion('1.0')
    .addTag('Pedidos')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  await app.listen(3000);
  console.log(`Swagger UI disponível em ${await app.getUrl()}/api`);
}
bootstrap();