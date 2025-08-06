import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RenomearPastaDto {
  @ApiProperty({ description: 'O novo nome para a pasta.' })
  @IsString()
  @IsNotEmpty()
  nom_pasta: string;
}