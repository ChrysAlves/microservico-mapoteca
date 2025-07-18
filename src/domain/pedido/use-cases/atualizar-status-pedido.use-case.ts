import { Injectable } from '@nestjs/common';
import { PedidoRepository } from '../repository/pedido.repository';
import { StatusPedido } from '@prisma/client';

export interface AtualizarStatusPedidoPayload {
  pedidoId: string;
  status: StatusPedido;
  mensagemErro?: string;
}

@Injectable()
export class AtualizarStatusPedidoUseCase {
  constructor(private readonly pedidoRepository: PedidoRepository) {}

  async execute({ pedidoId, status, mensagemErro }: AtualizarStatusPedidoPayload): Promise<void> {
    const pedido = await this.pedidoRepository.findById(pedidoId);

    if (!pedido) {
      console.error(`[AtualizarStatusPedidoUseCase] Pedido com ID ${pedidoId} não encontrado.`);
      return;
    }

    pedido.status = status;
    if (mensagemErro) {
      pedido.mensagemErro = mensagemErro;
    }

    await this.pedidoRepository.save(pedido);
    console.log(`[AtualizarStatusPedidoUseCase] Status do pedido ${pedidoId} atualizado para ${status}.`);
  }
}