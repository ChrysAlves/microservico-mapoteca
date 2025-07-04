// src/app.module.ts - VERSÃO FINAL E CORRETA
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DatabaseModule } from './infra/database/database.module';
import { PedidoRepository } from './domain/pedido/repository/pedido.repository';
import { PrismaPedidoRepository } from './infra/database/prisma/repositories/prisma-pedido.repository';
import { CriarPedidoUploadUseCase } from './domain/pedido/use-cases/criar-pedido-upload.use-case';
import { IngestionClientService } from './infra/messaging/ingestion.client';
import { MapotecaController } from './infra/controllers/mapoteca.controller';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // O HttpModule foi removido pois não é mais injetado em lugar nenhum
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
  ],
  controllers: [
    MapotecaController,
    AppController,
  ],
  providers: [
    AppService,
    {
      provide: PedidoRepository,
      useClass: PrismaPedidoRepository,
    },
    IngestionClientService,
    CriarPedidoUploadUseCase,
  ],
})
export class AppModule {}