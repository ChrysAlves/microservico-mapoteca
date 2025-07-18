import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as FormData from 'form-data';
import { promises as fs } from 'fs';

@Injectable()
export class StorageClient {
  private readonly logger = new Logger(StorageClient.name);
  private readonly storageServiceUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    const storageUrl = this.configService.get<string>('STORAGE_SERVICE_URL');

    if (!storageUrl) {
      throw new Error('Variável de ambiente STORAGE_SERVICE_URL não está definida!');
    }

    this.storageServiceUrl = storageUrl;
  }

  async uploadFileByPath(filePath: string, bucket: string, key: string): Promise<any> {
    this.logger.log(`Lendo arquivo do caminho: ${filePath}`);

    let fileBuffer: Buffer;
    try {
      fileBuffer = await fs.readFile(filePath);
    } catch (error) {
      this.logger.error(`Falha ao ler o arquivo do disco: ${filePath}`, error.stack);
      throw new Error(`Arquivo não encontrado em: ${filePath}`);
    }

    const formData = new FormData();
    formData.append('file', fileBuffer, key);
    formData.append('bucket', bucket);
    formData.append('key', key);

    const uploadUrl = `${this.storageServiceUrl}/storage/upload`;
    this.logger.log(`Enviando arquivo para o Storage Service em: ${uploadUrl}`);

    try {
      const response = await axios.post(uploadUrl, formData, {
        headers: {
          ...formData.getHeaders(),
        },
      });
      this.logger.log(`Resposta do Storage Service para o arquivo ${key}:`, response.data);
      return response.data;
    } catch (error) {
      this.logger.error(`Erro ao enviar arquivo para o Storage Service: ${error.message}`, error.stack);
      throw new Error('Falha na comunicação com o Microsserviço de Storage.');
    }
  }
}