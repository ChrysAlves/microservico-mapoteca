// src/domain/pedido/pedido.module.ts

import { Module } from '@nestjs/common';
import { HttpModule } from 'src/infra/http/http.module';
import { RedisModule } from '../../infra/redis/redis.module'; 
import { MapotecaController } from '../../infra/controllers/mapoteca.controller';
import { DatabaseModule } from '../../infra/database/database.module';
import { PrismaPedidoRepository } from '../../infra/database/prisma/repositories/prisma-pedido.repository';
import { PedidoRepository } from './repository/pedido.repository';
import { AtualizarStatusPedidoUseCase } from './use-cases/atualizar-status-pedido.use-case';
import { CriarPedidoDownloadUseCase } from './use-cases/criar-pedido-download.use-case';
import { CriarPedidoUploadUseCase } from './use-cases/criar-pedido-upload.use-case';
import { DeletarItemUseCase } from './use-cases/deletar-item.use-case';
import { GetItemDetailsUseCase } from './use-cases/get-item-details.use-case';
import { ListItemsUseCase } from './use-cases/list-items.use-case';
import { RenomearItemUseCase } from './use-cases/renomear-item.use-case';

@Module({
  imports: [
    DatabaseModule,
    HttpModule,
    RedisModule,
  ],
  controllers: [
    MapotecaController,
  ],
  providers: [
    CriarPedidoUploadUseCase,
    AtualizarStatusPedidoUseCase,
    CriarPedidoDownloadUseCase,
    DeletarItemUseCase,
    RenomearItemUseCase,
    GetItemDetailsUseCase,
    ListItemsUseCase,
    {
      provide: PedidoRepository,
      useClass: PrismaPedidoRepository,
    },
  ],
  exports: [
    CriarPedidoUploadUseCase,
    AtualizarStatusPedidoUseCase,
    CriarPedidoDownloadUseCase,
    DeletarItemUseCase,
    RenomearItemUseCase,
    GetItemDetailsUseCase,
    ListItemsUseCase,
  ],
})
export class PedidoModule {}