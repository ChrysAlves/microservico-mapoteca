// src/domain/pedido/dtos/processing-complete.dto.ts (ATUALIZADO)

import { Type } from 'class-transformer';
import { IsNotEmpty, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ArquivoProcessadoDto } from './arquivo-processado.dto';

export class ProcessingCompleteDto {
  @IsString()
  @IsNotEmpty()
  transferId: string;

  @IsObject()
  @ValidateNested() // Diz ao NestJS para validar o objeto aninhado também
  @Type(() => ArquivoProcessadoDto)
  original: ArquivoProcessadoDto;

  @IsObject()
  @ValidateNested()
  @IsOptional() // O arquivo de preservação pode não existir
  @Type(() => ArquivoProcessadoDto)
  preservacao?: ArquivoProcessadoDto;
}