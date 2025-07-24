// src/domain/pedido/pedido.module.ts

import { Module } from '@nestjs/common';
import { PedidoRepository } from './repository/pedido.repository';
import { PrismaPedidoRepository } from '../../infra/database/prisma/repositories/prisma-pedido.repository';
import { CriarPedidoUploadUseCase } from './use-cases/criar-pedido-upload.use-case';
import { AtualizarStatusPedidoUseCase } from './use-cases/atualizar-status-pedido.use-case';
import { MapotecaController } from '../../infra/controllers/mapoteca.controller';
import { MessagingModule } from '../../infra/messaging/messaging.module';
import { DatabaseModule } from '../../infra/database/database.module';
import { CriarPedidoDownloadUseCase } from './use-cases/criar-pedido-download.use-case';
import { HttpModule } from 'src/infra/http/http.module';

@Module({
  imports: [
    MessagingModule,
    DatabaseModule,
    HttpModule,
  ],
  controllers: [
    MapotecaController,
  ],
  providers: [
    CriarPedidoUploadUseCase,
    AtualizarStatusPedidoUseCase,
    CriarPedidoDownloadUseCase,
    {
      provide: PedidoRepository,
      useClass: PrismaPedidoRepository,
    },
  ],
  exports: [
    CriarPedidoUploadUseCase,
    AtualizarStatusPedidoUseCase,
    CriarPedidoDownloadUseCase,
  ],
})
export class PedidoModule {}