
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PedidoRepository } from '../repository/pedido.repository';
import { StatusPedido } from '@prisma/client';

export interface PreservacaoData {
  nome: string;
  caminho: string;
  checksum: string;
  formato: string;
}

export interface AtualizarStatusPedidoPayload {
  transferId: string; 
  status: StatusPedido;
  mensagemErro?: string;
  preservacaoData?: PreservacaoData;
}

@Injectable()
export class AtualizarStatusPedidoUseCase {
  private readonly logger = new Logger(AtualizarStatusPedidoUseCase.name);

  constructor(private readonly pedidoRepository: PedidoRepository) {}

  async execute(payload: AtualizarStatusPedidoPayload): Promise<void> {
    const { transferId, status, mensagemErro } = payload;
    
    this.logger.log(`Recebida notificação para atualizar status do Transfer ID ${transferId} para ${status}.`);

    const pedidoAtualizado = await this.pedidoRepository.updateStatusByTransferId(
      transferId,
      status,
      mensagemErro,
    );

    if (!pedidoAtualizado) {
      this.logger.error(`Pedido com Transfer ID ${transferId} não encontrado para atualização de status.`);
      throw new NotFoundException(`Pedido com Transfer ID ${transferId} não encontrado.`);
    }

    this.logger.log(`Status do pedido ${pedidoAtualizado.cod_id} (Transfer ID: ${transferId}) atualizado para ${status}.`);
  }
}