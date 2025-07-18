import { Module, forwardRef } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs'; // 1. Importe as classes do KafkaJS
import { ResultadosProcessamentoController } from '../resultados-processamento/resultados-processamento.controller';
import { PedidoModule } from '../../domain/pedido/pedido.module';

@Module({
  imports: [forwardRef(() => PedidoModule)], 
  controllers: [ResultadosProcessamentoController],
  providers: [
    // 2. Crie um "provider" customizado para o nosso produtor Kafka
    {
      provide: 'KAFKA_PRODUCER', // Um nome/token para identificar nosso produtor
      useFactory: async (): Promise<Producer> => {
        const kafka = new Kafka({
          clientId: 'mapoteca-producer',
          // Pega o endereço do broker do ambiente ou usa um padrão
          brokers: [process.env.KAFKA_BROKER || 'kafka:29092'],
        });
        const producer = kafka.producer();
        await producer.connect();
        return producer;
      },
    },
  ],
  // 3. EXPORTE o provider para que outros módulos possam usá-lo
  exports: ['KAFKA_PRODUCER'],
})
export class MessagingModule {}