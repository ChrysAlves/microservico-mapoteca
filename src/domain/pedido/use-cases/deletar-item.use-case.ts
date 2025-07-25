// ARQUIVO: src/domain/pedido/use-cases/deletar-item.use-case.ts

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { GestaoDadosClient } from '../../../infra/http/gestao-dados.client';
import { StorageClient } from '../../../infra/http/storage.client';

@Injectable()
export class DeletarItemUseCase {
  private readonly logger = new Logger(DeletarItemUseCase.name);

  constructor(
    private readonly gestaoDadosClient: GestaoDadosClient,
    private readonly storageClient: StorageClient,
  ) {}

  async execute(itemId: string): Promise<{ message: string }> {
    this.logger.log(`Iniciando fluxo de deleção para o item: ${itemId}`);

    try {
      const { filesToDelete } = await this.gestaoDadosClient.logicalDelete(itemId);
      this.logger.log(`${filesToDelete.length} arquivos marcados para deleção física.`);

      if (filesToDelete.length > 0) {
        for (const file of filesToDelete) {
          this.logger.log(`Solicitando deleção física para: ${file.bucket}/${file.path}`);
          await this.storageClient.deleteFile(file.bucket, file.path);
        }
      }
      
      this.logger.log(`Fluxo de deleção para o item ${itemId} concluído com sucesso.`);

      return { message: 'Item deletado com sucesso.' };

    } catch (error) {
      this.logger.error(`Falha no fluxo de deleção para o item ${itemId}: ${error.message}`, error.stack);
      
      if (error.response?.status === 404) {
        throw new NotFoundException(`O item com ID ${itemId} não foi encontrado.`);
      }
      
      throw new Error('Ocorreu uma falha ao processar o pedido de deleção.');
    }
  }
}