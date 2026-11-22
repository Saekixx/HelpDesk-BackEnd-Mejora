import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class AutoAssignQueryDto {
  @ApiProperty({ description: 'ID de la sucursal del ticket', example: 456 })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  id_sucursal: number;

  @ApiProperty({
    description: 'Fecha a evaluar en formato YYYY-MM-DD',
    example: '2026-10-15',
  })
  @IsString()
  @IsNotEmpty()
  fecha: string;
}
