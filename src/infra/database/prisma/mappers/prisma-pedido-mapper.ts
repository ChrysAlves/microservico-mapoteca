// src/infra/database/prisma/mappers/prisma-pedido-mapper.ts

import { Pedido as PedidoPrisma, Prisma } from '@prisma/client';
import { Pedido as PedidoEntity } from '../../../../domain/pedido/entities/pedido.entity';

export class PrismaPedidoMapper {
  static toDomain(raw: PedidoPrisma): PedidoEntity {
    return new PedidoEntity(raw);
  }

  static toPrisma(pedido: PedidoEntity): PedidoPrisma {
    return {
      id: pedido.id,
      tipo: pedido.tipo,
      status: pedido.status,
      origem: pedido.origem,
      solicitanteId: pedido.solicitanteId,
      ra: pedido.ra,
      documentoId: pedido.documentoId,
      nomeOriginal: pedido.nomeOriginal,
      caminhoMinIO: pedido.caminhoMinIO,
      // CORRIGIDO: Usamos 'null' em vez de Prisma.JsonNull
      metadadosIniciais: pedido.metadadosIniciais ?? null,
      mensagemErro: pedido.mensagemErro,
      createdAt: pedido.createdAt,
      updatedAt: pedido.updatedAt,
    };
  }
}