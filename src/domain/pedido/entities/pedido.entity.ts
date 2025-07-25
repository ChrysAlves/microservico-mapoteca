// src/domain/pedido/entities/pedido.entity.ts
import { Pedido as PedidoPrisma, TipoPedido, StatusPedido, Prisma } from '@prisma/client';

export class Pedido implements PedidoPrisma {
    id!: string;
    tipo!: TipoPedido;
    status!: StatusPedido;
    origem!: string;
    solicitanteId!: string | null;
    ra!: string; 
    documentoId!: string | null;
    nomeOriginal!: string | null;
    caminhoMinIO!: string | null;
    metadadosIniciais!: Prisma.JsonValue | null;
    mensagemErro!: string | null;
    createdAt!: Date;
    updatedAt!: Date;

    constructor(props: PedidoPrisma) {
        Object.assign(this, props);
    }

    static create(props: Omit<PedidoPrisma, 'id' | 'createdAt' | 'updatedAt'>): Pedido {
        const defaultProps: PedidoPrisma = {
            id: '', 
            createdAt: new Date(),
            updatedAt: new Date(),
            ...props,
        };
        return new Pedido(defaultProps);
    }

    public avancarStatus(novoStatus: StatusPedido, mensagem?: string): void {
        this.status = novoStatus;
        if (mensagem) {
            this.mensagemErro = mensagem;
        }
        this.updatedAt = new Date();
    }
}