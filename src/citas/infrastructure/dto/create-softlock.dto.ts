import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateSoftLockDto {
  @ApiProperty({ description: 'ID del técnico asignado', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  id_tecnico: number;

  @ApiProperty({
    description: 'Fecha de la reserva en formato YYYY-MM-DD',
    example: '2026-10-15',
  })
  @IsString()
  @IsNotEmpty()
  fecha: string;

  @ApiProperty({
    description: 'Franja horaria seleccionada',
    example: '09:00 - 12:00',
  })
  @IsString()
  @IsNotEmpty()
  franja: string;
}
