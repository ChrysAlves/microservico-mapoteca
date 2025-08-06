// src/infra/database/prisma/repositories/prisma-pedido.repository.ts

import { Injectable } from '@nestjs/common';
import { PedidoRepository } from '../../../../domain/pedido/repository/pedido.repository';
import { Pedido as PedidoEntity } from '../../../../domain/pedido/entities/pedido.entity';
import { StatusPedido } from '@prisma/client';
import { PrismaPedidoMapper } from '../mappers/prisma-pedido-mapper';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaPedidoRepository implements PedidoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(pedido: PedidoEntity): Promise<PedidoEntity> {
    const prismaData = PrismaPedidoMapper.toPrisma(pedido);

    const rawPedido = await this.prisma.tp_pedido.create({
      data: prismaData,
    });
    return PrismaPedidoMapper.toDomain(rawPedido);
  }

  async findById(id: string): Promise<PedidoEntity | null> {
    const pedido = await this.prisma.tp_pedido.findUnique({
      where: { cod_id: id },
    });
    return pedido ? PrismaPedidoMapper.toDomain(pedido) : null;
  }

  async updateStatus(id: string, newStatus: StatusPedido, errorMessage?: string): Promise<PedidoEntity> {
    const updatedPedido = await this.prisma.tp_pedido.update({
      where: { cod_id: id },
      data: {
        dsc_status: newStatus,
        dsc_mensagem_erro: errorMessage,
      },
    });
    return PrismaPedidoMapper.toDomain(updatedPedido);
  }

  async save(pedido: PedidoEntity): Promise<PedidoEntity> {
    const prismaData = PrismaPedidoMapper.toPrisma(pedido);
    
    // Corrigido de hor_created para dhs_created
    const { cod_id, dhs_created, ...updateData } = prismaData;

    const updatedPedido = await this.prisma.tp_pedido.update({
      where: { cod_id: pedido.cod_id },
      data: updateData,
    });
    return PrismaPedidoMapper.toDomain(updatedPedido);
  }

  async updateStatusByTransferId(transferId: string, newStatus: StatusPedido, errorMessage?: string): Promise<PedidoEntity | null> {
    const updateResult = await this.prisma.tp_pedido.updateMany({
      where: { cod_documento: transferId },
      data: {
        dsc_status: newStatus,
        dsc_mensagem_erro: errorMessage ?? null,
      },
    });

    if (updateResult.count === 0) {
      return null;
    }

    const updatedPedido = await this.prisma.tp_pedido.findFirst({
      where: { cod_documento: transferId },
    });

    return updatedPedido ? PrismaPedidoMapper.toDomain(updatedPedido) : null;
  }
}