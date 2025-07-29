// src/domain/pedido/use-cases/atualizar-status-pedido.use-case.ts

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PedidoRepository } from '../repository/pedido.repository';
import { StatusPedido } from '@prisma/client';

// Interface de dados para a preservação (pode manter)
export interface PreservacaoData {
  nome: string;
  caminho: string;
  checksum: string;
  formato: string;
}

// 1. ATUALIZAMOS O PAYLOAD PARA ESPERAR 'transferId'
export interface AtualizarStatusPedidoPayload {
  transferId: string; // ALTERADO de pedidoId para transferId
  status: StatusPedido;
  mensagemErro?: string;
  preservacaoData?: PreservacaoData;
}

@Injectable()
export class AtualizarStatusPedidoUseCase {
  private readonly logger = new Logger(AtualizarStatusPedidoUseCase.name);

  constructor(private readonly pedidoRepository: PedidoRepository) {}

  // 2. SIMPLIFICAMOS O MÉTODO EXECUTE
  async execute(payload: AtualizarStatusPedidoPayload): Promise<void> {
    const { transferId, status, mensagemErro } = payload;
    
    this.logger.log(`Recebida notificação para atualizar status do Transfer ID ${transferId} para ${status}.`);

    // Usamos diretamente o novo método do repositório, que é mais eficiente
    const pedidoAtualizado = await this.pedidoRepository.updateStatusByTransferId(
      transferId,
      status,
      mensagemErro,
    );

    if (!pedidoAtualizado) {
      // O repositório agora retorna null se não encontrar, então tratamos o erro aqui.
      this.logger.error(`Pedido com Transfer ID ${transferId} não encontrado para atualização de status.`);
      throw new NotFoundException(`Pedido com Transfer ID ${transferId} não encontrado.`);
    }

    this.logger.log(`Status do pedido ${pedidoAtualizado.id} (Transfer ID: ${transferId}) atualizado para ${status}.`);
  }
}