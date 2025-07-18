import { Module } from '@nestjs/common';
import { PedidoModule } from '../../domain/pedido/pedido.module';
import { ResultadosProcessamentoController } from './resultados-processamento.controller';

@Module({
  imports: [PedidoModule], // Importa o PedidoModule para ter acesso aos UseCases
  controllers: [ResultadosProcessamentoController],
})
export class ResultadosProcessamentoModule {}