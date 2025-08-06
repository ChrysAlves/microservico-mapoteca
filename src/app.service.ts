
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './infra/database/prisma/prisma.service';
import { StatusPedido } from '@prisma/client'; 

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  getHello(): string {
    return 'Microsserviço Mapoteca está no ar!';
  }

  async updateOrderStatus(transferId: string, newStatus: StatusPedido): Promise<void> {
    try {
      const pedido = await this.prisma.tp_pedido.findUnique({
        where: { cod_id: transferId },
      });

      if (!pedido) {
        throw new NotFoundException(`Pedido com ID ${transferId} não encontrado.`);
      }

      await this.prisma.tp_pedido.update({
        where: {
          cod_id: transferId,
        },
        data: {
          dsc_status: newStatus, 
        },
      });
    } catch (error) {
      console.error(`Falha ao atualizar o status do pedido ${transferId} para ${newStatus}`, error);
      throw error;
    }
  }
}