

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RenameRequestDto {
  @ApiProperty({
    description: 'O novo nome descritivo para o item.',
    example: 'Contrato Final Assinado',
  })
  @IsString()
  @IsNotEmpty()
  novoTitulo: string;
}