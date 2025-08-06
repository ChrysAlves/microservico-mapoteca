// src/domain/pasta/dto/criar-pasta.dto.ts

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CriarPastaDto {
  @ApiProperty({ description: 'Nome da nova pasta.' })
  @IsString()
  @IsNotEmpty()
  nom_pasta: string;

  @ApiPropertyOptional({ description: 'ID da pasta pai (para criar uma subpasta).' })
  @IsOptional()
  @IsUUID()
  cod_pai?: string;
}