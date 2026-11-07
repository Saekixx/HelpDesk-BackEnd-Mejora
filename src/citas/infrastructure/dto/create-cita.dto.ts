import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateCitaDto {
  @ApiProperty({ description: 'ID del ticket asociado', example: 123 })
  @IsNumber()
  @IsNotEmpty()
  id_ticket: number;

  @ApiProperty({ description: 'ID de la sucursal', example: 456 })
  @IsNumber()
  @IsNotEmpty()
  id_sucursal: number;

  @ApiProperty({
    description: 'Token de bloqueo (lock_token)',
    example: 'lock_abc123xyz',
  })
  @IsString()
  @IsNotEmpty()
  lock_token: string;
}
