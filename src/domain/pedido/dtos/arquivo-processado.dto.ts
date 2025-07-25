// src/domain/pedido/dtos/arquivo-processado.dto.ts

import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class ArquivoProcessadoDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

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

  @IsString()
  @IsNotEmpty()
  caminhoMinIO: string;
}