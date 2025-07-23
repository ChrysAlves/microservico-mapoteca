// src/app.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PedidoModule } from './domain/pedido/pedido.module';
import { DatabaseModule } from './infra/database/database.module';
import { MessagingModule } from './infra/messaging/messaging.module';
import { HttpModule } from './infra/http/http.module'; // ADICIONADO

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HttpModule, // ADICIONADO: Agora importa nosso módulo HTTP
    DatabaseModule,
    MessagingModule,
    PedidoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}