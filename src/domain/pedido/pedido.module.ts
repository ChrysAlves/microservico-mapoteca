// src/domain/pedido/pedido.module.ts

import { Module } from '@nestjs/common';
import { PedidoRepository } from './repository/pedido.repository';
import { PrismaPedidoRepository } from '../../infra/database/prisma/repositories/prisma-pedido.repository';
import { CriarPedidoUploadUseCase } from './use-cases/criar-pedido-upload.use-case';
import { AtualizarStatusPedidoUseCase } from './use-cases/atualizar-status-pedido.use-case';
import { MapotecaController } from '../../infra/controllers/mapoteca.controller';
import { MessagingModule } from '../../infra/messaging/messaging.module';
import { DatabaseModule } from '../../infra/database/database.module';

@Module({
  imports: [
    MessagingModule,
    DatabaseModule,
  ],
  controllers: [
    MapotecaController,
  ],
  providers: [
    CriarPedidoUploadUseCase,
    AtualizarStatusPedidoUseCase,
    {
      provide: PedidoRepository,
      useClass: PrismaPedidoRepository,
    },
  ],
  // ADICIONADO: Exporta os use cases para que outros módulos possam injetá-los
  exports: [
    CriarPedidoUploadUseCase,
    AtualizarStatusPedidoUseCase,
  ],
})
export class PedidoModule {}