// ARQUIVO: src/infra/messaging/ingestion.client.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import FormData = require('form-data');
import axios from 'axios';
import type { Express } from 'express';
import * as fs from 'fs'; 
import { CriarPedidoUploadDto } from 'src/domain/pedido/dtos/criar-pedido-upload.dto'; // Importe o DTO

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
    pedidoId: string,
    metadados: CriarPedidoUploadDto, 
    transferId: string,
  ): Promise<any> {
    const formData = new FormData();

    formData.append('pedidoId', pedidoId); 
    formData.append('transferId', transferId); 
    formData.append('ra', metadados.ra);
    formData.append('origem', metadados.origem);
    
    if (metadados.metadadosIniciais) {
      formData.append('metadadosIniciais', metadados.metadadosIniciais);
    }

    for (const file of files) {
      const fileStream = fs.createReadStream(file.path);
      formData.append('files', fileStream, file.originalname);
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
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = `${errorMessage}: ${JSON.stringify(error.response.data)}`;
      } else if (error instanceof Error) {
        errorMessage = `${errorMessage}: ${error.message}`;
      }
      throw new InternalServerErrorException(errorMessage);
    } finally {
      for (const file of files) {
        try {
          fs.unlinkSync(file.path);
        } catch (e) {
          console.error(`Falha ao limpar arquivo temporário: ${file.path}`, e);
        }
      }
    }
  }
}