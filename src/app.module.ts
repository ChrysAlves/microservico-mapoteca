import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PedidoModule } from './domain/pedido/pedido.module';
import { DatabaseModule } from './infra/database/database.module';
import { MessagingModule } from './infra/messaging/messaging.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HttpModule,
    DatabaseModule,
    MessagingModule,
    // Esta linha importa o PedidoModule, ganhando acesso aos seus exports
    PedidoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}