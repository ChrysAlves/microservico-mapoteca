// src/infra/database/prisma/mappers/prisma-pedido-mapper.ts

import { tp_pedido as PedidoPrisma } from '@prisma/client';
import { Pedido as PedidoEntity } from '../../../../domain/pedido/entities/pedido.entity';

export class PrismaPedidoMapper {
  static toDomain(raw: PedidoPrisma): PedidoEntity {
    return new PedidoEntity(raw);
  }

  static toPrisma(pedido: PedidoEntity): PedidoPrisma {
    return {
      cod_id: pedido.cod_id,
      dsc_tipo: pedido.dsc_tipo,
      nom_titulo: pedido.nom_titulo,
      dsc_status: pedido.dsc_status,
      cod_solicitante: pedido.cod_solicitante,
      nom_ra: pedido.nom_ra,
      cod_documento: pedido.cod_documento,
      nom_original: pedido.nom_original,
      cod_pasta: pedido.cod_pasta,
      dsc_caminho_minio: pedido.dsc_caminho_minio,
      dsc_metadados: pedido.dsc_metadados ?? null,
      dsc_mensagem_erro: pedido.dsc_mensagem_erro,
      dhs_created: pedido.dhs_created, 
      dhs_updated: pedido.dhs_updated, 
    };
  }
}