// src/domain/pedido/dtos/processing-complete.dto.ts

import { Type } from 'class-transformer';
import { IsNotEmpty, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ArquivoProcessadoDto } from './arquivo-processado.dto';

export class ProcessingCompleteDto {
  @IsString()
  @IsNotEmpty()
  transferId: string;

  @IsObject()
  @ValidateNested()
  @Type(() => ArquivoProcessadoDto)
  original: ArquivoProcessadoDto;

  @IsObject()
  @ValidateNested()
  @IsOptional()
  @Type(() => ArquivoProcessadoDto)
  preservacao?: ArquivoProcessadoDto;
}