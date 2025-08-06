// src/domain/pedido/entities/pedido.entity.ts
import { tp_pedido as PedidoPrisma, TipoPedido, StatusPedido, Prisma } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

export class Pedido implements PedidoPrisma {
    cod_id!: string;
    nom_titulo!: string | null;
    dsc_tipo!: TipoPedido;
    dsc_status!: StatusPedido;
    cod_solicitante!: string | null;
    nom_ra!: string;
    cod_pasta!: string | null;
    cod_documento!: string | null;
    nom_original!: string | null;
    dsc_caminho_minio!: string | null;
    dsc_metadados!: Prisma.JsonValue | null;
    dsc_mensagem_erro!: string | null;
    dhs_created!: Date;
    dhs_updated!: Date;

    constructor(props: PedidoPrisma) {
        Object.assign(this, props);
    }

    static create(props: Omit<PedidoPrisma, 'cod_id' | 'dhs_created' | 'dhs_updated'>): Pedido {
        const defaultProps: PedidoPrisma = {
            cod_id: uuidv4(),
            dhs_created: new Date(),
            dhs_updated: new Date(),
            ...props,
        };
        return new Pedido(defaultProps);
    }

    public avancarStatus(novoStatus: StatusPedido, mensagem?: string): void {
        this.dsc_status = novoStatus;
        if (mensagem) {
            this.dsc_mensagem_erro = mensagem;
        }
        this.dhs_updated = new Date();
    }
}