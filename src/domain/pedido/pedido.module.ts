import { Module, forwardRef } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CriarPedidoUploadUseCase } from './use-cases/criar-pedido-upload.use-case';
import { AtualizarStatusPedidoUseCase } from './use-cases/atualizar-status-pedido.use-case';
import { PedidoRepository } from './repository/pedido.repository';
import { MapotecaController } from '../../infra/controllers/mapoteca.controller';
import { ResultadosProcessamentoController } from '../../infra/resultados-processamento/resultados-processamento.controller';
import { PrismaPedidoRepository } from '../../infra/database/prisma/repositories/prisma-pedido.repository';
import { IngestionClientService } from '../../infra/messaging/ingestion.client';
import { DatabaseModule } from '../../infra/database/database.module';
import { MessagingModule } from '../../infra/messaging/messaging.module';
import { StorageClient } from '../../infra/http/storage.client'; // 1. Importe o novo cliente

@Module({
  imports: [DatabaseModule, forwardRef(() => MessagingModule), HttpModule],
  controllers: [MapotecaController, ResultadosProcessamentoController],
  providers: [
    CriarPedidoUploadUseCase,
    AtualizarStatusPedidoUseCase,
    IngestionClientService,
    StorageClient, // 2. Adicione o novo cliente aos providers
    {
      provide: PedidoRepository,
      useClass: PrismaPedidoRepository,
    },
  ],
  // 3. Exporte o novo cliente para que outros módulos possam usá-lo
  exports: [AtualizarStatusPedidoUseCase, IngestionClientService, StorageClient],
})
export class PedidoModule {}