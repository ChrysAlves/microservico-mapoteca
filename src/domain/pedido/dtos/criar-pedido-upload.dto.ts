import { TipoPedido, StatusPedido, Prisma } from '@prisma/client';

export type BaseMetadadosIniciais = Prisma.JsonObject;

export class CriarPedidoUploadDto {
  origem!: string;
  solicitanteId?: string;
  nomeOriginal?: string;
  metadadosIniciais?: BaseMetadadosIniciais;
  documentoId?: string;
  ra!: string; // ADICIONADO: Campo para o RA
}