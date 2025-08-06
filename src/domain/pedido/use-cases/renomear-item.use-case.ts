// src/domain/pedido/use-cases/renomear-item.use-case.ts

import { Injectable, Logger } from '@nestjs/common';
import { GestaoDadosClient } from '../../../infra/http/gestao-dados.client';
import { RenomearItemDto } from '../dtos/renomear-item.dto';

@Injectable()
export class RenomearItemUseCase {
  private readonly logger = new Logger(RenomearItemUseCase.name);

  constructor(
    private readonly gestaoDadosClient: GestaoDadosClient,
  ) {}

  async execute(dto: RenomearItemDto): Promise<any> {
    const { itemId, novoTitulo } = dto;
    this.logger.log(`Executando caso de uso de renomeação para o item ${itemId}`);

    try {
      const resultado = await this.gestaoDadosClient.renameAip(itemId, novoTitulo);
      return resultado;
    } catch (error) {
      this.logger.error(`Falha ao renomear item ${itemId}`, error.stack);
      throw error;
    }
  }
}