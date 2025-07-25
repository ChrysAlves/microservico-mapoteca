// ARQUIVO: src/infra/http/gestao-dados.client.ts

import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

export interface FileLocationResponse {
  bucket: string;
  path: string;
  filename: string;
}

export interface FilesToDeleteResponse {
  message: string;
  filesToDelete: { bucket: string; path: string }[];
}

@Injectable()
export class GestaoDadosClient {
  private readonly logger = new Logger(GestaoDadosClient.name);
  private readonly baseURL: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    const gestaoDadosUrl = this.configService.get<string>('GESTAO_DADOS_API_URL');
    if (!gestaoDadosUrl) {
      throw new Error('Variável de ambiente GESTAO_DADOS_API_URL não está definida!');
    }
    this.baseURL = gestaoDadosUrl;
  }

  async getLocation(aipId: string): Promise<FileLocationResponse> {
    const url = `${this.baseURL}/aips/${aipId}/location`;
    this.logger.log(`Buscando localização do AIP ${aipId} em ${url}`);

    try {
      const response = await firstValueFrom(
        this.httpService.get<FileLocationResponse>(url),
      );
      this.logger.log(`Localização recebida para o AIP ${aipId}.`);
      return response.data;
    } catch (error) {
      this.logger.error(`Erro ao buscar localização para o AIP ${aipId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async logicalDelete(aipId: string): Promise<FilesToDeleteResponse> {
    const url = `${this.baseURL}/aips/${aipId}/logical-delete`;
    this.logger.log(`Solicitando deleção lógica para o AIP ${aipId} em ${url}`);

    try {
      const response = await firstValueFrom(
        this.httpService.post<FilesToDeleteResponse>(url),
      );
      this.logger.log(`Deleção lógica para o AIP ${aipId} confirmada pelo serviço.`);
      return response.data;
    } catch (error) {
      this.logger.error(`Erro ao solicitar deleção lógica para o AIP ${aipId}: ${error.message}`, error.stack);
      throw error; 
    }
  }
}