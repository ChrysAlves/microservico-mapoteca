
import { Controller, Post, Body, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { AtualizarStatusPedidoUseCase } from '../../domain/pedido/use-cases/atualizar-status-pedido.use-case';
import { StatusPedido } from '@prisma/client';

interface ProcessamentoCompletoPayload {
  transferId: string;
  original: object;
  preservacao?: {
    nome: string;
    caminho: string;
    checksum: string;
    formato: string;
  };
}

@Controller('internal')
export class ResultadosProcessamentoController {
  private readonly logger = new Logger(ResultadosProcessamentoController.name);

  constructor(
    private readonly atualizarStatusPedidoUseCase: AtualizarStatusPedidoUseCase,
  ) {}

  @Post('processing-complete')
  @HttpCode(HttpStatus.OK)
  async handleProcessingResult(@Body() payload: ProcessamentoCompletoPayload): Promise<{ message: string }> {
    this.logger.log(`[HTTP] Resultado de processamento recebido para o pedido: ${payload.transferId}`);

    const { transferId, preservacao } = payload;

    const statusFinal = preservacao ? StatusPedido.COMPLETED : StatusPedido.FAILED;
    const mensagemDeErro = preservacao ? undefined : "Falha na normalização do arquivo.";

    await this.atualizarStatusPedidoUseCase.execute({
      transferId: transferId,
      status: statusFinal,
      mensagemErro: mensagemDeErro,
      preservacaoData: preservacao, 
    });

    return { message: 'Notificação recebida com sucesso.' };
  }
}