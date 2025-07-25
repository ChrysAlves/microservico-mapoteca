// src/infra/http/dtos/upload-request.http.dto.ts

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsJSON } from 'class-validator';

export class UploadRequestHttpDto {
  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    description: 'Um ou mais arquivos para upload.',
    required: true,
  })
  files!: any[]; // <-- CORREÇÃO AQUI


  @ApiProperty({ example: '1234567', description: 'Registro Acadêmico do aluno.' })
  ra: string;

  @ApiProperty({
    description: 'Identificador da origem da requisição (ex: "frontend-web")',
    example: 'frontend-web',
  })
  @IsString()
  @IsNotEmpty()
  origem!: string; // <-- CORREÇÃO AQUI

  @ApiPropertyOptional({
    description: 'ID do usuário ou sistema solicitante.',
    example: 'usuario-abc-123',
  })
  @IsOptional()
  @IsString()
  solicitanteId?: string; // Propriedades opcionais com '?' não precisam do '!'

  @ApiPropertyOptional({
    description: 'String JSON contendo metadados descritivos adicionais.',
    example: '{"descricao": "Contrato 2025", "tags": ["importante"]}',
  })
  @IsOptional()
  @IsJSON()
  metadadosIniciais?: string; // Propriedades opcionais com '?' não precisam do '!'
}