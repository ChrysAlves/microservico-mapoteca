// src/infra/database/prisma/repositories/prisma-pedido.repository.ts

import { Injectable } from '@nestjs/common';
import { PedidoRepository } from '../../../../domain/pedido/repository/pedido.repository';
import { Pedido as PedidoEntity } from '../../../../domain/pedido/entities/pedido.entity';
import { StatusPedido } from '@prisma/client'; // Removido Prisma não utilizado
import { PrismaPedidoMapper } from '../mappers/prisma-pedido-mapper';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaPedidoRepository implements PedidoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(pedido: PedidoEntity): Promise<PedidoEntity> {
    const rawPedido = await this.prisma.pedido.create({
      data: {
        tipo: pedido.tipo,
        status: pedido.status,
        origem: pedido.origem,
        solicitanteId: pedido.solicitanteId,
        ra: pedido.ra,
        documentoId: pedido.documentoId,
        nomeOriginal: pedido.nomeOriginal,
        caminhoMinIO: pedido.caminhoMinIO,
        metadadosIniciais: pedido.metadadosIniciais ?? null,
        mensagemErro: pedido.mensagemErro,
      },
    });
    return PrismaPedidoMapper.toDomain(rawPedido);
  }

  async findById(id: string): Promise<PedidoEntity | null> {
    const pedido = await this.prisma.pedido.findUnique({
      where: { id },
    });
    return pedido ? PrismaPedidoMapper.toDomain(pedido) : null;
  }

  async updateStatus(id: string, newStatus: StatusPedido, errorMessage?: string): Promise<PedidoEntity> {
    const updatedPedido = await this.prisma.pedido.update({
      where: { id },
      data: {
        status: newStatus,
        mensagemErro: errorMessage,
        updatedAt: new Date(),
      },
    });
    return PrismaPedidoMapper.toDomain(updatedPedido);
  }

  async save(pedido: PedidoEntity): Promise<PedidoEntity> {
    const { id, createdAt, ...updateData } = PrismaPedidoMapper.toPrisma(pedido);
    const updatedPedido = await this.prisma.pedido.update({
      where: { id: pedido.id },
      data: updateData,
    });
    return PrismaPedidoMapper.toDomain(updatedPedido);
  }

  // --- NOVO MÉTODO ADICIONADO AQUI ---
  async updateStatusByTransferId(transferId: string, newStatus: StatusPedido, errorMessage?: string): Promise<PedidoEntity | null> {
    // Primeiro, atualizamos todos os pedidos que correspondem ao transferId (deve ser apenas um)
    const updateResult = await this.prisma.pedido.updateMany({
      where: { documentoId: transferId },
      data: {
        status: newStatus,
        mensagemErro: errorMessage ?? null,
        updatedAt: new Date(),
      },
    });

    // Se nenhum registro foi atualizado, significa que não encontramos o pedido.
    if (updateResult.count === 0) {
      return null;
    }

    // Buscamos o pedido recém-atualizado para retorná-lo
    const updatedPedido = await this.prisma.pedido.findFirst({
      where: { documentoId: transferId },
    });

    return updatedPedido ? PrismaPedidoMapper.toDomain(updatedPedido) : null;
  }
}