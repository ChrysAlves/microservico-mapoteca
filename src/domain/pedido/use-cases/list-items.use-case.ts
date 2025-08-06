// ARQUIVO: src/domain/pedido/use-cases/list-items.use-case.ts

import { Injectable, Logger } from '@nestjs/common';
import { GestaoDadosClient } from '../../../infra/http/gestao-dados.client';

@Injectable()
export class ListItemsUseCase {
  private readonly logger = new Logger(ListItemsUseCase.name);

  constructor(
    private readonly gestaoDadosClient: GestaoDadosClient,
  ) {}

  async execute() {
    this.logger.log(`Executando caso de uso para listar todos os itens`);
    return this.gestaoDadosClient.findAllAips();
  }
}