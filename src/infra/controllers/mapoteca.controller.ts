// src/infra/controllers/mapoteca.controller.ts
import { Controller, Post, Body, UploadedFiles, UseInterceptors, InternalServerErrorException, HttpStatus, HttpCode, BadRequestException } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CriarPedidoUploadUseCase } from '../../domain/pedido/use-cases/criar-pedido-upload.use-case';
import { UploadRequestHttpDto } from '../http/dtos/upload-request.http.dto';
import { Pedido } from '../../domain/pedido/entities/pedido.entity';
import { ApiConsumes, ApiBody, ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import type { Express } from 'express';

@ApiTags('Pedidos')
@Controller('pedidos')
export class MapotecaController {
  constructor(
    private readonly criarPedidoUploadUseCase: CriarPedidoUploadUseCase,
  ) {}

  @Post('upload')
  @ApiOperation({ summary: 'Solicita o upload de documentos para preservação.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload de arquivos e metadados.',
    type: UploadRequestHttpDto,
  })
  @ApiResponse({ status: 202, description: 'Pedido de upload recebido.' })
  @UseInterceptors(FilesInterceptor('files'))
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
}