import { Pedido as PedidoPrisma, Prisma } from '@prisma/client';
import { Pedido as PedidoEntity } from '../../../../domain/pedido/entities/pedido.entity'; 

export class PrismaPedidoMapper {
  static toDomain(raw: PedidoPrisma): PedidoEntity {
    return new PedidoEntity(raw);
  }


  static toPrisma(pedido: PedidoEntity): Omit<Prisma.PedidoUncheckedCreateInput, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      tipo: pedido.tipo,
      status: pedido.status,
      origem: pedido.origem,
      solicitanteId: pedido.solicitanteId,
      documentoId: pedido.documentoId,
      nomeOriginal: pedido.nomeOriginal,
      caminhoMinIO: pedido.caminhoMinIO,
      metadadosIniciais: pedido.metadadosIniciais === null ? Prisma.JsonNull : (pedido.metadadosIniciais as Prisma.InputJsonValue),
      mensagemErro: pedido.mensagemErro,
    };
  }
}