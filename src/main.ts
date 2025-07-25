// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
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

  // Conecta a aplicação como um consumidor de Kafka
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
      },
      consumer: {
        groupId: 'mapoteca-results-consumer',
      },
    },
  });

  // Inicia todos os microserviços (o consumidor Kafka)
  await app.startAllMicroservices();

  
  await app.listen(3000);
  console.log(`Mapoteca HTTP server está rodando em: ${await app.getUrl()}`);
  console.log(`Mapoteca Kafka consumer está ouvindo por resultados...`);
}
bootstrap();