
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


export interface FileDetails {
  id: number;
  nome: string;
  formato: string;
  tipo: string;
  tamanho_bytes: number;
  ultima_modificacao: Date;
}

export interface AipDetailsResponse {
  transfer_id: string;
  titulo: string | null;
  data_criacao: Date;
  arquivos: FileDetails[];
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

  async renameAip(aipId: string, novoTitulo: string): Promise<{ message: string; novo_titulo: string }> {
    const url = `${this.baseURL}/aips/${aipId}/rename`;
    const payload = { novo_titulo: novoTitulo };

    this.logger.log(`Solicitando renomeação do AIP ${aipId} para "${novoTitulo}" em ${url}`);

    try {
      const response = await firstValueFrom(
        this.httpService.put<{ message: string; novo_titulo: string }>(url, payload),
      );
      this.logger.log(`AIP ${aipId} renomeado com sucesso via serviço de Gestão de Dados.`);
      return response.data;
    } catch (error) {
      this.logger.error(`Erro ao solicitar renomeação para o AIP ${aipId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getAipDetails(aipId: string): Promise<AipDetailsResponse> {
    const url = `${this.baseURL}/aips/${aipId}/details`;
    this.logger.log(`Buscando detalhes completos do AIP ${aipId} em ${url}`);

    try {
      const response = await firstValueFrom(
        this.httpService.get<AipDetailsResponse>(url),
      );
      this.logger.log(`Detalhes recebidos para o AIP ${aipId}.`);
      return response.data;
    } catch (error) {
      this.logger.error(`Erro ao buscar detalhes para o AIP ${aipId}: ${error.message}`, error.stack);
      throw error;
    }
  }


  async findAllAips(): Promise<AipDetailsResponse[]> {
    const url = `${this.baseURL}/aips`;
    this.logger.log(`Buscando todos os AIPs em ${url}`);

    try {
      const response = await firstValueFrom(
        this.httpService.get<AipDetailsResponse[]>(url),
      );
      this.logger.log(`Recebidos ${response.data.length} AIPs do serviço de Gestão de Dados.`);
      return response.data;
    } catch (error) {
      this.logger.error(`Erro ao buscar todos os AIPs: ${error.message}`, error.stack);
      throw error;
    }
  }
}