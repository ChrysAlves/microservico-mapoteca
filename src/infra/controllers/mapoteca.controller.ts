// src/infra/controllers/mapoteca.controller.ts

import {
  BadRequestException, Body, Controller, Delete, Get, HttpCode,
  HttpStatus, InternalServerErrorException, Param, Post, Put,
  UploadedFiles, UseInterceptors, Logger, HttpException
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import * as fs from 'fs';
import { diskStorage } from 'multer';
import * as path from 'path';
import { CriarPedidoUploadDto } from '../../domain/pedido/dtos/criar-pedido-upload.dto';
import { CriarPedidoDownloadUseCase } from '../../domain/pedido/use-cases/criar-pedido-download.use-case';
import { CriarPedidoUploadUseCase } from '../../domain/pedido/use-cases/criar-pedido-upload.use-case';
import { DeletarItemUseCase } from '../../domain/pedido/use-cases/deletar-item.use-case';
import { RenomearItemUseCase } from '../../domain/pedido/use-cases/renomear-item.use-case';
import { RenameRequestDto } from '../http/dtos/rename-request.dto';
import { UploadRequestHttpDto } from '../http/dtos/upload-request.http.dto';
import { GetItemDetailsUseCase } from '../../domain/pedido/use-cases/get-item-details.use-case';
import { ListItemsUseCase } from '../../domain/pedido/use-cases/list-items.use-case';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ListarConteudoPastaDto } from '../../domain/pedido/dtos/listar-conteudo-pasta.dto';
import { CriarPastaDto } from '../../domain/pedido/dtos/criar-pasta.dto';
import { RenomearPastaDto } from 'src/domain/pedido/dtos/renomear-pasta.dto';

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

@ApiTags('API Principal')
@Controller()
export class MapotecaController {
  private readonly logger = new Logger(MapotecaController.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly criarPedidoUploadUseCase: CriarPedidoUploadUseCase,
    private readonly criarPedidoDownloadUseCase: CriarPedidoDownloadUseCase,
    private readonly deletarItemUseCase: DeletarItemUseCase,
    private readonly renomearItemUseCase: RenomearItemUseCase,
    private readonly getItemDetailsUseCase: GetItemDetailsUseCase,
    private readonly listItemsUseCase: ListItemsUseCase,
  ) {}

  // =======================================================================
  // == ENDPOINTS DE PEDIDOS (ARQUIVOS)
  // =======================================================================

  @Post('pedidos/upload')
  @ApiOperation({ summary: 'Solicita o upload de documentos para preservação.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadRequestHttpDto })
  @HttpCode(HttpStatus.ACCEPTED)
  @UseInterceptors(FilesInterceptor('files', 100, { storage: tempStorage }))
  async requestUpload(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() body: UploadRequestHttpDto,
  ): Promise<{ message: string; pedidosCriados: any[] }> {
    if (!files || files.length === 0) {
      throw new BadRequestException('Nenhum arquivo enviado. O campo "files" é obrigatório.');
    }
    try {
      const metadadosParaUseCase = {
        ra: body.ra,
        solicitanteId: body.solicitanteId,
        pastaId: body.pastaId,
        metadadosIniciais: body.metadadosIniciais
          ? JSON.parse(body.metadadosIniciais)
          : undefined,
      };

      return await this.criarPedidoUploadUseCase.execute({
        files: files,
        metadados: metadadosParaUseCase as CriarPedidoUploadDto,
      });

    } catch (error) {
      this.logger.error('Erro no MapotecaController.requestUpload:', error);
      throw new InternalServerErrorException('Falha ao processar pedido de upload.');
    }
  }

  @Get('pedidos/:id/download')
  @ApiOperation({ summary: 'Obtém uma URL para download de um item preservado.' })
  async criarPedidoDownload(@Param('id') aipId: string) {
    return this.criarPedidoDownloadUseCase.execute(aipId);
  }

  @Delete('pedidos/:id')
  @ApiOperation({ summary: 'Solicita a deleção de um item preservado (AIP).' })
  @HttpCode(HttpStatus.ACCEPTED)
  async deletarItem(@Param('id') itemId: string) {
    return this.deletarItemUseCase.execute(itemId);
  }

  @Put('pedidos/:id/rename')
  @ApiOperation({ summary: 'Renomeia o título descritivo de um item.' })
  async renomearItem(
    @Param('id') itemId: string,
    @Body() body: RenameRequestDto,
  ) {
    return this.renomearItemUseCase.execute({
      itemId: itemId,
      novoTitulo: body.novoTitulo,
    });
  }

  @Get('pedidos/:id')
  @ApiOperation({ summary: 'Busca os detalhes completos de um item preservado (AIP).' })
  async getItemDetails(@Param('id') itemId: string) {
    return this.getItemDetailsUseCase.execute(itemId);
  }

  @Get('pedidos')
  @ApiOperation({ summary: 'Lista todos os itens preservados (AIPs).' })
  async listAllItems() {
    return this.listItemsUseCase.execute();
  }
  
  // =======================================================================
  // == ENDPOINTS DE PASTAS
  // =======================================================================

  @Post('pastas')
  @ApiOperation({ summary: 'Cria uma nova pasta.' })
  async criarPasta(@Body() criarPastaDto: CriarPastaDto) {
    try {
      const gestaoDadosUrl = `http://gestao_dados_app:8000/pastas/`;
      this.logger.log(`Repassando requisição de criação de pasta para: ${gestaoDadosUrl}`);

      const response = await firstValueFrom(
        this.httpService.post(gestaoDadosUrl, criarPastaDto),
      );
      return response.data;
    } catch (error) {
      this.logger.error('Erro ao criar pasta', error.response?.data);
      throw new HttpException(
        error.response?.data?.detail || 'Não foi possível criar a pasta.',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('pastas')
  @ApiOperation({ summary: 'Lista todas as pastas existentes.' })
  async listarPastas() {
    try {
      const gestaoDadosUrl = `http://gestao_dados_app:8000/pastas/`;
      this.logger.log(`Repassando requisição para listar pastas: ${gestaoDadosUrl}`);
      const response = await firstValueFrom(this.httpService.get(gestaoDadosUrl));
      return response.data;
    } catch (error) {
      this.logger.error('Erro ao listar pastas', error.response?.data);
      throw new HttpException(
        'Não foi possível listar as pastas.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('pastas/:id')
  @ApiOperation({ summary: 'Lista o conteúdo de uma pasta específica.' })
  async listarConteudoPasta(
    @Param('id') id: string,
  ): Promise<ListarConteudoPastaDto> {
    try {
      const gestaoDadosUrl = `http://gestao_dados_app:8000/pastas/${id}`;
      this.logger.log(`Repassando requisição para: ${gestaoDadosUrl}`);
      const response = await firstValueFrom(
        this.httpService.get<ListarConteudoPastaDto>(gestaoDadosUrl),
      );
      return response.data;
    } catch (error) {
      this.logger.error('Erro ao buscar conteúdo da pasta', error.response?.data);
      throw new HttpException(
        'Não foi possível buscar o conteúdo da pasta.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('pastas/:id')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Deleta uma pasta e todo o seu conteúdo em cascata.' })
  async deletarPasta(@Param('id') id: string) {
    try {
      const gestaoDadosUrl = `http://gestao_dados_app:8000/pastas/${id}`;
      this.logger.log(`Repassando requisição de deleção de pasta para: ${gestaoDadosUrl}`);
      
      const response = await firstValueFrom(
        this.httpService.delete<{ message: string, filesToDelete: { bucket: string, path: string }[] }>(gestaoDadosUrl),
      );

      const filesToDelete = response.data.filesToDelete;
      this.logger.log(`${filesToDelete.length} arquivos para deletar do MinIO.`);
      
      if (filesToDelete.length > 0) {
        this.logger.log('TODO: Implementar a chamada ao serviço de storage para deletar os arquivos físicos.');
      }
      
      return { message: "Pedido de deleção da pasta e seu conteúdo foi iniciado." };

    } catch (error) {
      this.logger.error('Erro ao deletar pasta', error.response?.data);
      throw new HttpException(
        error.response?.data?.detail || 'Não foi possível deletar a pasta.',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }




  @Put('pastas/:id')
  @ApiOperation({ summary: 'Renomeia uma pasta.' })
  async renomearPasta(
    @Param('id') id: string,
    @Body() renomearPastaDto: RenomearPastaDto,) {
    try {
      const gestaoDadosUrl = `http://gestao_dados_app:8000/pastas/${id}`;
      this.logger.log(`Repassando requisição para renomear pasta: ${gestaoDadosUrl}`);

      const response = await firstValueFrom(
        this.httpService.put<{ message: string, moveOperations: { bucket: string, source: string, destination: string }[] }>(
          gestaoDadosUrl,
          renomearPastaDto,
        ),
      );
      const moveOperations = response.data.moveOperations;
      this.logger.log(`${moveOperations.length} arquivos para mover no MinIO.`);

      if (moveOperations.length > 0) {
        this.logger.log('Iniciando movimentação dos arquivos físicos no storage...');
        
        const storageUrl = 'http://storage_app:3003/storage/move';
        
        await Promise.all(
          moveOperations.map(op => 
            firstValueFrom(this.httpService.post(storageUrl, op))
          )
        );
        
        this.logger.log('Movimentação dos arquivos físicos concluída.');
      }
      
      return { message: "Pasta renomeada e arquivos movidos com sucesso." };

    } catch (error) {
      this.logger.error('Erro ao renomear pasta', error.response?.data || error.message);
      throw new HttpException(
        error.response?.data?.detail || 'Não foi possível renomear a pasta.',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}