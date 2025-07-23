// src/domain/pedido/dtos/arquivo-processado.dto.ts

import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class ArquivoProcessadoDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  // ADICIONADO: Campo para o nome original do arquivo
  @IsString()
  @IsOptional()
  nomeOriginal?: string;

  @IsString()
  @IsNotEmpty()
  caminho: string;

  @IsString()
  @IsNotEmpty()
  checksum: string;

  @IsString()
  @IsNotEmpty()
  formato: string;

  // ADICIONADO: O campo que estava faltando para o caminho no Minio
  @IsString()
  @IsNotEmpty()
  caminhoMinIO: string;
}