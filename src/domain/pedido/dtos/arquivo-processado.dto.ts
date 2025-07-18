// src/domain/pedido/dtos/arquivo-processado.dto.ts

import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class ArquivoProcessadoDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsString()
  @IsNotEmpty()
  caminho: string;

  @IsString()
  @IsNotEmpty()
  checksum: string;

  @IsString()
  @IsNotEmpty()
  formato: string;
}