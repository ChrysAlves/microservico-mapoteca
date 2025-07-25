// src/infra/messaging/messaging.module.ts

import { Module, forwardRef } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';
import { ResultadosProcessamentoController } from '../resultados-processamento/resultados-processamento.controller';
import { PedidoModule } from '../../domain/pedido/pedido.module';
import { IngestionClientService } from './ingestion.client'; // 1. Importe o serviço

@Module({
  imports: [forwardRef(() => PedidoModule)], 
  controllers: [ResultadosProcessamentoController],
  providers: [
    IngestionClientService,
    {
      provide: 'KAFKA_PRODUCER',
      useFactory: async (): Promise<Producer> => {
        const kafka = new Kafka({
          clientId: 'mapoteca-producer',
          brokers: [process.env.KAFKA_BROKER || 'kafka:29092'],
        });
        const producer = kafka.producer();
        await producer.connect();
        return producer;
      },
    },
  ],
  exports: ['KAFKA_PRODUCER', IngestionClientService],
})
export class MessagingModule {}