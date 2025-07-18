import { Body, Controller, Get, Post } from '@nestjs/common';
import { ProcessingCompleteDto } from './domain/pedido/dtos/processing-complete.dto';
import { AtualizarStatusPedidoUseCase } from './domain/pedido/use-cases/atualizar-status-pedido.use-case';
import { StatusPedido } from '@prisma/client';
import { StorageClient } from './infra/http/storage.client';

@Controller()
export class AppController {
  constructor(
    private readonly atualizarStatusPedido: AtualizarStatusPedidoUseCase,
    private readonly storageClient: StorageClient,
  ) {}

  @Get()
  getHello(): string {
    return 'Microsserviço Mapoteca está no ar!';
  }

  @Post('internal/processing-complete')
  async handleProcessingComplete(@Body() payload: ProcessingCompleteDto) {
    console.log('--- [MAPOTECA] Notificação de Processamento Detalhada Recebida! ---');
    console.log('Payload:', JSON.stringify(payload, null, 2));

    try {
      await this.atualizarStatusPedido.execute({
        pedidoId: payload.transferId,
        status: StatusPedido.PROCESSED,
      });

      console.log(`[MAPOTECA] Enviando arquivo original para armazenamento...`);
      await this.storageClient.uploadFileByPath(
        payload.original.caminho,
        'documentos', // nome do bucket
        payload.original.nome, // nome do arquivo (chave)
      );
      console.log(`[MAPOTECA] Arquivo original salvo com sucesso.`);

      if (payload.preservacao && payload.preservacao.caminho) {
        console.log(`[MAPOTECA] Enviando arquivo de preservação para armazenamento...`);
        await this.storageClient.uploadFileByPath(
          payload.preservacao.caminho,
          'preservation', // nome do bucket
          payload.preservacao.nome, // nome do arquivo (chave)
        );
        console.log(`[MAPOTECA] Arquivo de preservação salvo com sucesso.`);
      }

      await this.atualizarStatusPedido.execute({
        pedidoId: payload.transferId,
        status: StatusPedido.COMPLETED,
      });
      console.log(`[MAPOTECA] FLUXO CONCLUÍDO! Pedido ${payload.transferId} finalizado.`);

    } catch (error) {
      console.error('[MAPOTECA] ERRO na orquestração final:', error.message);
      await this.atualizarStatusPedido.execute({
        pedidoId: payload.transferId,
        status: StatusPedido.FAILED,
        mensagemErro: 'Falha ao salvar arquivos no armazenamento final.',
      });
    }
    
    return { status: 'flow_completed' };
  }
}