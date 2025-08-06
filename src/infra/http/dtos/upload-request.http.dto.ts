import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UploadRequestHttpDto {
  @ApiPropertyOptional({ description: 'O RA (Registro de Arquivo) do item (opcional).' })
  @IsOptional()
  @IsString()
  ra?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  solicitanteId?: string;

  @ApiPropertyOptional({ description: 'Metadados iniciais em formato JSON stringificado.' })
  @IsOptional()
  @IsString()
  metadadosIniciais?: string;

  @ApiPropertyOptional({
    description: 'ID da pasta onde o item será armazenado (opcional).',
  })
  @IsOptional()
  @IsString()
  pastaId?: string;
}