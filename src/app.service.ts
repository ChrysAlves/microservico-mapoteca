// microservico-mapoteca-v2/src/app.service.ts (ATUALIZADO)

import { Injectable, NotFoundException } from '@nestjs/common';
// 1. Importe seu PrismaService
import { PrismaService } from './infra/database/prisma/prisma.service'; // Verifique se este caminho está correto

@Injectable()
export class AppService {
  // 2. Injete o PrismaService no construtor
  constructor(private readonly prisma: PrismaService) {}

  getHello(): string {
    return 'Microsserviço Mapoteca está no ar!';
  }

  // 3. CRIE O NOVO MÉTODO PARA ATUALIZAR O STATUS
  async updateOrderStatus(transferId: string, newStatus: string): Promise<void> {
    try {
      // O Prisma usa o nome do model em minúsculas (ex: 'pedido')
      const pedido = await this.prisma.pedido.findUnique({
        where: { id: transferId },
      });

      if (!pedido) {
        throw new NotFoundException(`Pedido com ID ${transferId} não encontrado.`);
      }

      await this.prisma.pedido.update({
        where: {
          id: transferId, 
        },
        data: {
          status: newStatus, 
        },
      });
    } catch (error) {
      console.error(`Falha ao atualizar o status do pedido ${transferId} para ${newStatus}`, error);
      // Lança o erro para que o controller possa capturá-lo e decidir o que fazer
      throw error;
    }
  }
}