// ARQUIVO: src/domain/pedido/use-cases/criar-pedido-upload.use-case.ts

import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PedidoRepository } from '../repository/pedido.repository';
import { Pedido } from '../entities/pedido.entity';
import type { Express } from 'express';
import { CriarPedidoUploadDto } from '../dtos/criar-pedido-upload.dto';
import { IngestionClientService } from '../../../infra/messaging/ingestion.client';
import { v4 as uuidv4 } from 'uuid';

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
  ): Promise<{ message: string, pedidosCriados: any[] }> {
    const { files, metadados } = payload;
    const { ra, origem, solicitanteId, metadadosIniciais } = metadados;

    if (!ra) {
      throw new BadRequestException('O campo "ra" é obrigatório.');
    }

    const pedidosCriados = [];

    for (const file of files) {
      const transferId = uuidv4(); 
      this.logger.log(`Iniciando processo para ${file.originalname} com Transfer ID: ${transferId}`);
      
      const novoPedido = Pedido.create({
        tipo: TipoPedido.UPLOAD,
        status: StatusPedido.PENDING,
        origem: origem,
        ra: ra, 
        solicitanteId: solicitanteId ?? null,
        nomeOriginal: file.originalname,
        metadadosIniciais: metadadosIniciais ?? null,
        caminhoMinIO: null,
        documentoId: transferId, 
        mensagemErro: null,
      });

      const pedidoSalvo = await this.pedidoRepository.create(novoPedido);
      this.logger.log(`[CriarPedidoUploadUseCase] Pedido individual ${pedidoSalvo.id} criado.`);

      this.iniciarProcessamentoEmBackground(file, metadados, pedidoSalvo.id, transferId);
      
      pedidosCriados.push({
        arquivoOriginal: file.originalname,
        pedidoId: pedidoSalvo.id,
        transferId: transferId,
      });
    }

    return {
      message: `${files.length} pedidos de upload individuais foram iniciados com sucesso.`,
      pedidosCriados: pedidosCriados,
    };
  }

  private async iniciarProcessamentoEmBackground(
    file: Express.Multer.File, 
    metadados: CriarPedidoUploadDto,
    pedidoId: string,
    transferId: string, 
  ) {
    this.logger.log(`[BG] Iniciando envio para Ingestão para o pedido ${pedidoId}`);
    try {
      await this.ingestionClientService.sendFilesToIngestion(
        [file], 
        pedidoId,
        metadados,
        transferId, 
      );
      this.logger.log(`[BG] Chamada ao Microsserviço de Ingestão para pedido ${pedidoId} enviada.`);
      
      await this.pedidoRepository.updateStatus(pedidoId, StatusPedido.RECEIVED_BY_INGESTION);
      this.logger.log(`[BG] Status do pedido ${pedidoId} atualizado para RECEIVED_BY_INGESTION.`);

    } catch (error: unknown) {
    }
  }
}