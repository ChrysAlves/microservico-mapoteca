// src/infra/messaging/ingestion.client.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import FormData = require('form-data');
import axios from 'axios';
import type { Express } from 'express';

@Injectable()
export class IngestionClientService {
  private readonly ingestionServiceUrl: string;

  constructor(
    private readonly configService: ConfigService,
  ) {
    const url = this.configService.get<string>('INGESTION_SERVICE_URL');
    if (!url) {
      throw new Error('A variável de ambiente INGESTION_SERVICE_URL não está definida!');
    }
    this.ingestionServiceUrl = url;
  }

  async sendFilesToIngestion(
    files: Express.Multer.File[],
    transferId: string,
    metadados: any,
  ): Promise<any> {
    const formData = new FormData(); 
    formData.append('transferId', transferId);
    formData.append('metadados', JSON.stringify(metadados));

    for (const file of files) {
      formData.append('files', file.buffer, file.originalname);
    }

    const ingestUrl = `${this.ingestionServiceUrl}/ingest`;

    try {
      console.log(`[IngestionClientService] Enviando ${files.length} arquivos para Ingestão em ${ingestUrl}`);
      
      const response = await axios.post(ingestUrl, formData, {
        headers: {
          ...formData.getHeaders(),
        },
      });

      return response.data;
    } catch (error: unknown) {
      console.error('[IngestionClientService] Erro ao enviar para Ingestão.', error);
      let errorMessage = 'Falha na comunicação com o Microsserviço de Ingestão.';
      if (axios.isAxiosError(error)) {
        errorMessage = `${errorMessage}: ${error.message}`;
      } else if (error instanceof Error) {
        errorMessage = `${errorMessage}: ${error.message}`;
      }
      throw new InternalServerErrorException(errorMessage);
    }
  }
}