// src/domain/pedido/use-cases/criar-pedido-upload.use-case.ts

import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PedidoRepository } from '../repository/pedido.repository';
import { Pedido } from '../entities/pedido.entity';
import type { Express } from 'express';
import { CriarPedidoUploadDto } from '../dtos/criar-pedido-upload.dto';
import { IngestionClientService } from '../../../infra/messaging/ingestion.client';


export enum StatusPedido {
  PENDING = 'PENDING',
  RECEIVED_BY_INGESTION = 'RECEIVED_BY_INGESTION',
  FAILED = 'FAILED',
}

export enum TipoPedido {
  UPLOAD = 'UPLOAD',
}


@Injectable()
export class CriarPedidoUploadUseCase {
  private readonly logger = new Logger(CriarPedidoUploadUseCase.name);

  constructor(
    private readonly pedidoRepository: PedidoRepository,
    private readonly ingestionClientService: IngestionClientService,
  ) {}

  async execute(
    payload: {
      files: Express.Multer.File[];
      metadados: CriarPedidoUploadDto;
    },
  ): Promise<Pedido> {
    const { files, metadados } = payload;

    if (!metadados.ra) {
      throw new BadRequestException('O campo "ra" é obrigatório.');
    }

    const novoPedido = Pedido.create({
      tipo: TipoPedido.UPLOAD,
      status: StatusPedido.PENDING,
      origem: metadados.origem,
      ra: metadados.ra,
      solicitanteId: metadados.solicitanteId ?? null,
      nomeOriginal: files[0]?.originalname ?? null,
      metadadosIniciais: metadados.metadadosIniciais ?? null,
      caminhoMinIO: null,
      documentoId: null,
      mensagemErro: null,
    });

    const pedidoSalvo = await this.pedidoRepository.create(novoPedido);
    this.logger.log(`[CriarPedidoUploadUseCase] Pedido ${pedidoSalvo.id} criado com status PENDING.`);

    this.iniciarProcessamentoEmBackground(files, metadados, pedidoSalvo.id);

    return pedidoSalvo;
  }

  private async iniciarProcessamentoEmBackground(
    files: Express.Multer.File[],
    metadados: CriarPedidoUploadDto,
    pedidoId: string,
  ) {
    this.logger.log(`[BG] Iniciando envio para Ingestão para o pedido ${pedidoId}`);
    try {

      await this.ingestionClientService.sendFilesToIngestion(
        files,
        pedidoId,
        metadados,
      );
      this.logger.log(`[BG] Chamada ao Microsserviço de Ingestão para pedido ${pedidoId} enviada.`);
      
      await this.pedidoRepository.updateStatus(pedidoId, StatusPedido.RECEIVED_BY_INGESTION);
      this.logger.log(`[BG] Status do pedido ${pedidoId} atualizado para RECEIVED_BY_INGESTION.`);

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      this.logger.error(`[BG] Erro ao acionar Microsserviço de Ingestão para ${pedidoId}:`, error);
      await this.pedidoRepository.updateStatus(pedidoId, StatusPedido.FAILED, `Falha ao acionar Ingestão: ${errorMessage}`);
    }
  }
}