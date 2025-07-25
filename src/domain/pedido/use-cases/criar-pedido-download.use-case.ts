// ARQUIVO: src/domain/pedido/use-cases/criar-pedido-download.use-case.ts

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { GestaoDadosClient } from '../../../infra/http/gestao-dados.client';
import { StorageClient } from '../../../infra/http/storage.client';

export interface DownloadInfo {
  downloadUrl: string;
  filename: string;
}

@Injectable()
export class CriarPedidoDownloadUseCase {
  private readonly logger = new Logger(CriarPedidoDownloadUseCase.name);

  constructor(
    private readonly gestaoDadosClient: GestaoDadosClient,
    private readonly storageClient: StorageClient,
  ) {}

  async execute(aipId: string): Promise<DownloadInfo> {
    this.logger.log(`Iniciando fluxo de download para o AIP ID: ${aipId}`);

    try {
      const location = await this.gestaoDadosClient.getLocation(aipId);
      this.logger.log(`Localização encontrada: bucket=${location.bucket}, path=${location.path}`);

      const presignedUrlResponse = await this.storageClient.generatePresignedUrl(
        location.bucket,
        location.path,
      );
      this.logger.log(`URL pré-assinada gerada com sucesso.`);

      return {
        downloadUrl: presignedUrlResponse.url,
        filename: location.filename,
      };
    } catch (error) {
      this.logger.error(`Falha no fluxo de download para o AIP ID ${aipId}: ${error.message}`, error.stack);
      
      if (error.response?.status === 404) {
        throw new NotFoundException(`O item com ID ${aipId} ou seu arquivo correspondente não foi encontrado.`);
      }
      
      throw new Error('Ocorreu uma falha ao processar o pedido de download.');
    }
  }
}