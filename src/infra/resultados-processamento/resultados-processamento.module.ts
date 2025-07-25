import { Module } from '@nestjs/common';
import { PedidoModule } from '../../domain/pedido/pedido.module';
import { ResultadosProcessamentoController } from './resultados-processamento.controller';

@Module({
  imports: [PedidoModule], 
  controllers: [ResultadosProcessamentoController],
})
export class ResultadosProcessamentoModule {}