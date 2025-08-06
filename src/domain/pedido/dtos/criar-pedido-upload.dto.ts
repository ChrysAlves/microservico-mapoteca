import { TipoPedido, StatusPedido, Prisma } from '@prisma/client';

export type BaseMetadadosIniciais = Prisma.JsonObject;

export class CriarPedidoUploadDto {
  solicitanteId?: string;
  nomeOriginal?: string;
  metadadosIniciais?: BaseMetadadosIniciais;
  documentoId?: string;
  ra?: string;
  pastaId?: string;

}