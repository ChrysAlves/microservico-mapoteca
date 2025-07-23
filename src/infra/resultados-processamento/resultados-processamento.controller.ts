// src/infra/messaging/resultados-processamento/resultados-processamento.controller.ts

import { Controller, Post, Body, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { AtualizarStatusPedidoUseCase } from '../../domain/pedido/use-cases/atualizar-status-pedido.use-case';
import { StatusPedido } from '@prisma/client';

// Interface para o payload que o processing_app envia
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

// O controller agora escuta em /internal, como esperado pelo log de inicialização
@Controller('internal')
export class ResultadosProcessamentoController {
  private readonly logger = new Logger(ResultadosProcessamentoController.name);

  constructor(
    private readonly atualizarStatusPedidoUseCase: AtualizarStatusPedidoUseCase,
  ) {}

  // Este é o endpoint HTTP que o processing_app está chamando
  @Post('processing-complete')
  @HttpCode(HttpStatus.OK)
  async handleProcessingResult(@Body() payload: ProcessamentoCompletoPayload): Promise<{ message: string }> {
    this.logger.log(`[HTTP] Resultado de processamento recebido para o pedido: ${payload.transferId}`);

    const { transferId, preservacao } = payload;

    // Determina o status final com base na existência do arquivo de preservação
    const statusFinal = preservacao ? StatusPedido.COMPLETED : StatusPedido.FAILED;
    const mensagemDeErro = preservacao ? undefined : "Falha na normalização do arquivo.";

    await this.atualizarStatusPedidoUseCase.execute({
      pedidoId: transferId,
      status: statusFinal,
      mensagemErro: mensagemDeErro,
      preservacaoData: preservacao, // Passa os dados do arquivo de preservação
    });

    return { message: 'Notificação recebida com sucesso.' };
  }
}