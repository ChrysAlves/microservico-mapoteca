// src/domain/pedido/use-cases/criar-pedido-upload.use-case.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { PedidoRepository } from '../repository/pedido.repository';
import { Pedido } from '../entities/pedido.entity';
import { StatusPedido, TipoPedido } from '@prisma/client';
import type { Express } from 'express'; 
import { CriarPedidoUploadDto } from '../dtos/criar-pedido-upload.dto';
// ...
import { IngestionClientService } from '../../../infra/messaging/ingestion.client';
// ...
@Injectable()
export class CriarPedidoUploadUseCase {
  constructor(
    private readonly pedidoRepository: PedidoRepository,
    private readonly ingestionClientService: IngestionClientService,
  ) {}

  // --- GARANTA QUE ESTE MÉTODO 'execute' EXISTA E ESTEJA CORRETO ---
  async execute(
    payload: {
      files: Express.Multer.File[];
      metadados: CriarPedidoUploadDto;
    },
  ): Promise<Pedido> {
    const { files, metadados } = payload;

    const novoPedido = Pedido.create({
      tipo: TipoPedido.UPLOAD,
      status: StatusPedido.PENDING,
      origem: metadados.origem,
      solicitanteId: metadados.solicitanteId ?? null,
      nomeOriginal: files[0]?.originalname ?? null,
      metadadosIniciais: metadados.metadadosIniciais ?? null,
      caminhoMinIO: null,
      documentoId: null,
      mensagemErro: null,
    });

    const pedidoSalvo = await this.pedidoRepository.create(novoPedido);
    console.log(`[CriarPedidoUploadUseCase] Pedido ${pedidoSalvo.id} criado com status PENDING.`);

    try {
      await this.ingestionClientService.sendFilesToIngestion(
        files,
        pedidoSalvo.id,
        metadados,
      );
      console.log(`[CriarPedidoUploadUseCase] Chamada ao Microsserviço de Ingestão para pedido ${pedidoSalvo.id} enviada.`);
      
      await this.pedidoRepository.updateStatus(pedidoSalvo.id, StatusPedido.RECEIVED_BY_INGESTION);
      console.log(`[CriarPedidoUploadUseCase] Status do pedido ${pedidoSalvo.id} atualizado para RECEIVED_BY_INGESTION.`);

      const pedidoAtualizado = await this.pedidoRepository.findById(pedidoSalvo.id);
      if (!pedidoAtualizado) {
        throw new NotFoundException(`Pedido com ID ${pedidoSalvo.id} não encontrado.`);
      }
      return pedidoAtualizado;

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error(`[CriarPedidoUploadUseCase] Erro ao acionar Microsserviço de Ingestão para ${pedidoSalvo.id}:`, error);
      await this.pedidoRepository.updateStatus(pedidoSalvo.id, StatusPedido.FAILED, `Falha ao acionar Ingestão: ${errorMessage}`);
      throw error;
    }
  }
}