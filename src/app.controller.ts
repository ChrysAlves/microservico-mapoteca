
import { Body, Controller, Get, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AtualizarStatusPedidoUseCase } from './domain/pedido/use-cases/atualizar-status-pedido.use-case';
import { StatusPedido } from '@prisma/client';

class FinalStatusDto {
  transferId: string;
  status: 'COMPLETED' | 'FAILED';
  message?: string;
}

@Controller()
export class AppController {
  constructor(
    private readonly atualizarStatusPedido: AtualizarStatusPedidoUseCase,
  ) {}

  @Get()
  getHello(): string {
    return 'Microsserviço Mapoteca está no ar!';
  }

  @Post('internal/processing-complete')
  @HttpCode(HttpStatus.OK)
  async handleProcessingComplete(@Body() payload: FinalStatusDto) {
    console.log(`--- [MAPOTECA] Notificação de Status Recebida para o pedido ${payload.transferId} ---`);

    const finalStatus = payload.status === 'COMPLETED' ? StatusPedido.COMPLETED : StatusPedido.FAILED;

    await this.atualizarStatusPedido.execute({
      transferId: payload.transferId,
      status: finalStatus,
      mensagemErro: payload.message,
    });
    
    console.log(`[MAPOTECA] FLUXO CONCLUÍDO! Pedido ${payload.transferId} finalizado com status ${finalStatus}.`);
    return { status: 'notification_received' };
  }
}