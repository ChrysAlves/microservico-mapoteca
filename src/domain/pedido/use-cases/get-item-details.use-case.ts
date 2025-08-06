// ARQUIVO: src/domain/pedido/use-cases/get-item-details.use-case.ts

import { Injectable, Logger } from '@nestjs/common';
import { GestaoDadosClient } from '../../../infra/http/gestao-dados.client';

@Injectable()
export class GetItemDetailsUseCase {
  private readonly logger = new Logger(GetItemDetailsUseCase.name);

  constructor(
    private readonly gestaoDadosClient: GestaoDadosClient,
  ) {}

  async execute(itemId: string) {
    this.logger.log(`Executando caso de uso para buscar detalhes do item ${itemId}`);
    return this.gestaoDadosClient.getAipDetails(itemId);
  }
}