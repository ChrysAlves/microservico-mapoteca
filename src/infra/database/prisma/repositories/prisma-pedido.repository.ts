// src/infra/database/prisma/repositories/prisma-pedido.repository.ts

import { Injectable } from '@nestjs/common';
import { PedidoRepository } from '../../../../domain/pedido/repository/pedido.repository';
import { Pedido as PedidoEntity } from '../../../../domain/pedido/entities/pedido.entity';
import { StatusPedido, Prisma } from '@prisma/client';
import { PrismaPedidoMapper } from '../mappers/prisma-pedido-mapper';
import { PrismaService } from '../prisma.service'; // Importa o serviço central

@Injectable()
export class PrismaPedidoRepository implements PedidoRepository {
  // CORRIGIDO: Recebemos o PrismaService via injeção de dependência
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
}