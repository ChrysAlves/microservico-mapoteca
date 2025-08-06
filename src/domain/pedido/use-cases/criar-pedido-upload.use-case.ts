// ARQUIVO: src/domain/pedido/use-cases/criar-pedido-upload.use-case.ts

import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { StatusPedido, TipoPedido } from '@prisma/client';
import { promises as fs } from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { RedisService } from '../../../infra/redis/redis.service';
import { sanitizeFilename } from '../../../infra/utils/sanitize-filename';
import { CriarPedidoUploadDto } from '../dtos/criar-pedido-upload.dto';
import { Pedido } from '../entities/pedido.entity';
import { PedidoRepository } from '../repository/pedido.repository';


const SIP_STORAGE_DIR = '/app/temp_ingestao_sip';
@Injectable()
export class CriarPedidoUploadUseCase {
  private readonly logger = new Logger(CriarPedidoUploadUseCase.name);

  constructor(
    private readonly pedidoRepository: PedidoRepository,
    private readonly redisService: RedisService,
  ) { }

  async execute(
    payload: {
      files: Express.Multer.File[];
      metadados: CriarPedidoUploadDto;
    },
  ): Promise<{ message: string, pedidosCriados: any[] }> {
    const { files, metadados } = payload;
    const { ra, solicitanteId, metadadosIniciais, pastaId } = metadados;

    this.logger.log('Corrigindo e sanitizando nomes de arquivos...');
    for (const file of files) {
      const correctedEncodingName = Buffer.from(file.originalname, 'latin1').toString('utf8');
      const finalSanitizedName = sanitizeFilename(correctedEncodingName);
      this.logger.log(`Nome do arquivo final: '${file.originalname}' -> '${finalSanitizedName}'`);
      file.originalname = finalSanitizedName;
    }

    if (!ra && !pastaId) {
      throw new BadRequestException('É obrigatório fornecer um "ra" ou um "pastaId".');
    }

    const pedidosCriados = [];

    for (const file of files) {
      const transferId = uuidv4();
      this.logger.log(`Iniciando processo para ${file.originalname} com Transfer ID: ${transferId}`);

      const novoPedido = Pedido.create({
        dsc_tipo: TipoPedido.UPLOAD,
        dsc_status: StatusPedido.PENDING,
        nom_titulo: file.originalname,
        nom_ra: ra,
        cod_pasta: pastaId, 
        cod_solicitante: solicitanteId ?? null,
        nom_original: file.originalname,
        dsc_metadados: metadadosIniciais ?? null,
        dsc_caminho_minio: null,
        cod_documento: transferId,
        dsc_mensagem_erro: null,
      });

      const pedidoSalvo = await this.pedidoRepository.create(novoPedido);
      this.logger.log(`[CriarPedidoUploadUseCase] Pedido individual ${pedidoSalvo.cod_id} criado.`);

      this.iniciarProcessamentoEmBackground(file, metadados, pedidoSalvo.cod_id, transferId);

      pedidosCriados.push({
        arquivoOriginal: file.originalname,
        pedidoId: pedidoSalvo.cod_id,
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
    this.logger.log(`[BG] Iniciando ingestão para o pedido ${pedidoId}`);
    const tempPath = file.path;

    try {
      const finalSipDir = path.join(SIP_STORAGE_DIR, transferId);
      const finalSipPath = path.join(finalSipDir, file.originalname);

      await fs.mkdir(finalSipDir, { recursive: true });
      this.logger.log(`[BG] Copiando de ${tempPath} para ${finalSipPath}`);
      await fs.copyFile(tempPath, finalSipPath);

      this.logger.log(`[BG] Arquivo copiado com sucesso para a área de ingestão.`);

      const job = {
        transferId: transferId,
        ra: metadados.ra,
        pastaId: metadados.pastaId,
      };
      await this.redisService.lpush('ingest-queue', JSON.stringify(job));
      this.logger.log(`[BG] Tarefa para ${transferId} (Pasta: ${metadados.pastaId}) publicada na fila 'ingest-queue' do Redis.`);

      await this.pedidoRepository.updateStatus(pedidoId, StatusPedido.QUEUED_FOR_PROCESSING);
      this.logger.log(`[BG] Status do pedido ${pedidoId} atualizado para QUEUED_FOR_PROCESSING.`);

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      this.logger.error(`[BG] Erro no processo de ingestão para ${pedidoId}:`, error);
      await this.pedidoRepository.updateStatus(pedidoId, StatusPedido.FAILED, `Falha na ingestão: ${errorMessage}`);

    } finally {

      try {
        this.logger.log(`[BG] Limpando arquivo temporário: ${tempPath}`);
        await fs.unlink(tempPath);
      } catch (cleanupError) {
        this.logger.error(`[BG] Falha ao limpar arquivo temporário ${tempPath}`, cleanupError);
      }
    }
  }
}