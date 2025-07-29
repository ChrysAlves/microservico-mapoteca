
import { Pedido } from '../entities/pedido.entity';
import { StatusPedido } from '@prisma/client';

export abstract class PedidoRepository {
    abstract create(pedido: Pedido): Promise<Pedido>;
    abstract findById(id: string): Promise<Pedido | null>;
    abstract updateStatus(id: string, newStatus: StatusPedido, errorMessage?: string): Promise<Pedido>;
    abstract updateStatusByTransferId(transferId: string, newStatus: StatusPedido, errorMessage?: string): Promise<Pedido | null>;

    abstract save(pedido: Pedido): Promise<Pedido>;
}