// src/domain/pedido/use-cases/atualizar-status-pedido.use-case.ts

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PedidoRepository } from '../repository/pedido.repository';
import { StatusPedido } from '@prisma/client';
import { Pedido } from '../entities/pedido.entity';

// Interface para os dados do arquivo de preservação
export interface PreservacaoData {
  nome: string;
  caminho: string;
  checksum: string;
  formato: string;
}

// CORRIGIDO: Adicionada a propriedade 'preservacaoData'
export interface AtualizarStatusPedidoPayload {
  pedidoId: string;
  status: StatusPedido;
  mensagemErro?: string;
  preservacaoData?: PreservacaoData;
}

@Injectable()
export class AtualizarStatusPedidoUseCase {
  private readonly logger = new Logger(AtualizarStatusPedidoUseCase.name);

  constructor(private readonly pedidoRepository: PedidoRepository) {}

  async execute({ pedidoId, status, mensagemErro, preservacaoData }: AtualizarStatusPedidoPayload): Promise<void> {
    const pedido = await this.pedidoRepository.findById(pedidoId);

    if (!pedido) {
      this.logger.error(`Pedido com ID ${pedidoId} não encontrado.`);
      throw new NotFoundException(`Pedido com ID ${pedidoId} não encontrado.`);
    }

    pedido.status = status;
    if (mensagemErro) {
      pedido.mensagemErro = mensagemErro;
    }
    if (preservacaoData) {
      pedido.caminhoMinIO = preservacaoData.caminho;
    }

    await this.pedidoRepository.save(pedido);
    this.logger.log(`Status do pedido ${pedidoId} atualizado para ${status}.`);
  }
}