// microservico-mapoteca-v2/src/app.service.ts (CORRIGIDO)

import { Injectable, NotFoundException } from '@nestjs/common';
// 1. Importe o PrismaService e o enum StatusPedido
import { PrismaService } from './infra/database/prisma/prisma.service';
import { StatusPedido } from '@prisma/client'; // ADICIONADO

@Injectable()
export class AppService {
  // 2. Injete o PrismaService no construtor
  constructor(private readonly prisma: PrismaService) {}

  getHello(): string {
    return 'Microsserviço Mapoteca está no ar!';
  }

  // 3. CORRIGIDO: O método agora usa o tipo correto 'StatusPedido'
  async updateOrderStatus(transferId: string, newStatus: StatusPedido): Promise<void> {
    try {
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
          status: newStatus, // Agora os tipos são compatíveis
        },
      });
    } catch (error) {
      console.error(`Falha ao atualizar o status do pedido ${transferId} para ${newStatus}`, error);
      throw error;
    }
  }
}