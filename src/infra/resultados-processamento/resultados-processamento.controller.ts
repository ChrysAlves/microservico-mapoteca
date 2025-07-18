import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AtualizarStatusPedidoUseCase } from '../../domain/pedido/use-cases/atualizar-status-pedido.use-case';
import { StatusPedido } from '@prisma/client';

interface ResultadoProcessamentoPayload {
  transferId: string;
  status: 'PROCESSED' | 'FAILED';
  message?: string;
}

@Controller()
export class ResultadosProcessamentoController {
  constructor(
    private readonly atualizarStatusPedidoUseCase: AtualizarStatusPedidoUseCase,
  ) {}

  @MessagePattern('processing-results')
  async handleProcessingResult(@Payload() payload: ResultadoProcessamentoPayload): Promise<void> {
    console.log('[ResultadosProcessamentoController] Resultado recebido do Kafka:', payload);

    const { transferId, status, message } = payload;

    if (!transferId || !status) {
      console.error('[ResultadosProcessamentoController] Mensagem inválida recebida.');
      return;
    }

    const novoStatus = status === 'PROCESSED' ? StatusPedido.PROCESSED : StatusPedido.FAILED;

    await this.atualizarStatusPedidoUseCase.execute({
      pedidoId: transferId,
      status: novoStatus,
      mensagemErro: message,
    });
  }
}