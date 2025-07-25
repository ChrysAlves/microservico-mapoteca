import { Controller, Post, Body, UploadedFiles, UseInterceptors, InternalServerErrorException, HttpStatus, HttpCode, BadRequestException, Get, Param, Delete } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CriarPedidoUploadUseCase } from '../../domain/pedido/use-cases/criar-pedido-upload.use-case';
import { UploadRequestHttpDto } from '../http/dtos/upload-request.http.dto';
import { Pedido } from '../../domain/pedido/entities/pedido.entity';
import { ApiConsumes, ApiBody, ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import type { Express } from 'express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { CriarPedidoDownloadUseCase } from '../../domain/pedido/use-cases/criar-pedido-download.use-case';
import { DeletarItemUseCase } from 'src/domain/pedido/use-cases/deletar-item.use-case';

const TEMP_UPLOADS_DIR = '/app/temp_uploads';

const tempStorage = diskStorage({
  destination: (req, file, cb) => {
    fs.mkdirSync(TEMP_UPLOADS_DIR, { recursive: true });
    cb(null, TEMP_UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

@ApiTags('Pedidos')
@Controller('pedidos')
export class MapotecaController {
  constructor(
    private readonly criarPedidoUploadUseCase: CriarPedidoUploadUseCase,
    private readonly criarPedidoDownloadUseCase: CriarPedidoDownloadUseCase,
    private readonly deletarItemUseCase: DeletarItemUseCase, 
  ) { }

  @Post('upload')
  @ApiOperation({ summary: 'Solicita o upload de documentos para preservação.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload de arquivos e metadados.',
    type: UploadRequestHttpDto,
  })
  @ApiResponse({ status: 202, description: 'Pedido de upload recebido.' })
  @UseInterceptors(FilesInterceptor('files', 10, { storage: tempStorage }))
  @HttpCode(HttpStatus.ACCEPTED)
  async requestUpload(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() body: UploadRequestHttpDto,
  ): Promise<{ message: string; pedidoId: string }> {
    if (!files || files.length === 0) {
      throw new BadRequestException('Nenhum arquivo enviado. O campo "files" é obrigatório.');
    }
    try {
      const parsedBody = {
        ...body,
        metadadosIniciais: body.metadadosIniciais ? JSON.parse(body.metadadosIniciais) : undefined,
      };

      const pedidoCriado: Pedido = await this.criarPedidoUploadUseCase.execute({
        files: files,
        metadados: parsedBody,
      });

      return {
        message: 'Pedido de upload recebido e processamento iniciado.',
        pedidoId: pedidoCriado.id,
      };
    } catch (error) {
      console.error('Erro no MapotecaController.requestUpload:', error);
      throw new InternalServerErrorException('Falha ao processar pedido de upload.');
    }
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Obtém uma URL para download de um item preservado.' })
  @ApiResponse({ status: 200, description: 'URL de download gerada com sucesso.' })
  @ApiResponse({ status: 404, description: 'Item não encontrado.' })
  async criarPedidoDownload(@Param('id') aipId: string) {
    return this.criarPedidoDownloadUseCase.execute(aipId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Solicita a deleção de um item preservado.' })
  @ApiResponse({ status: 202, description: 'Pedido de deleção aceito e em processamento.' })
  @ApiResponse({ status: 404, description: 'Item não encontrado.' })
  @HttpCode(HttpStatus.ACCEPTED) 
  async deletarItem(@Param('id') itemId: string) {
    return this.deletarItemUseCase.execute(itemId);
  }
}