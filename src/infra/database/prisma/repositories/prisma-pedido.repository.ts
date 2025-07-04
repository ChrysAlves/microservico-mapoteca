// src/infra/database/prisma/repositories/prisma-pedido.repository.ts

import { Injectable } from '@nestjs/common';
import { PedidoRepository } from '../../../../domain/pedido/repository/pedido.repository';
import { Pedido as PedidoEntity } from '../../../../domain/pedido/entities/pedido.entity';
import { PrismaClient, StatusPedido, Prisma } from '@prisma/client'; // Importar PrismaClient
import { PrismaPedidoMapper } from '../mappers/prisma-pedido-mapper';

@Injectable()
export class PrismaPedidoRepository implements PedidoRepository {
  // !! MUDANÇA CRÍTICA: Instanciamos o PrismaClient diretamente !!
  private prisma: PrismaClient;

  constructor() {
    // Em vez de receber via injeção, criamos a instância aqui.
    // Isso ignora o sistema de DI do NestJS que está falhando.
    this.prisma = new PrismaClient();
  }

  async create(pedido: PedidoEntity): Promise<PedidoEntity> {
    const rawPedido = await this.prisma.pedido.create({ // Agora this.prisma não será undefined
      data: {
        tipo: pedido.tipo,
        status: pedido.status,
        origem: pedido.origem,
        solicitanteId: pedido.solicitanteId,
        documentoId: pedido.documentoId,
        nomeOriginal: pedido.nomeOriginal,
        caminhoMinIO: pedido.caminhoMinIO,
        metadadosIniciais: pedido.metadadosIniciais ?? Prisma.JsonNull,
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
    const updateData = PrismaPedidoMapper.toPrisma(pedido);
    const updatedPedido = await this.prisma.pedido.update({
      where: { id: pedido.id },
      data: {
        tipo: updateData.tipo,
        status: updateData.status,
        origem: updateData.origem,
        solicitanteId: updateData.solicitanteId,
        documentoId: updateData.documentoId,
        nomeOriginal: updateData.nomeOriginal,
        caminhoMinIO: updateData.caminhoMinIO,
        metadadosIniciais: updateData.metadadosIniciais ?? Prisma.JsonNull,
        mensagemErro: updateData.mensagemErro,
      },
    });
    return PrismaPedidoMapper.toDomain(updatedPedido);
  }
}