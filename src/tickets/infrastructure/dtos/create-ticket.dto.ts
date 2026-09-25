import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
} from 'class-validator';
import { EstadoTicket } from '../../domain/entities/ticket.entity';

export class CreateTicketDto {
  @ApiProperty({
    description: 'Asunto o título del ticket',
    example: 'Problema con la impresora de la oficina',
  })
  @IsString()
  @IsNotEmpty()
  asunto: string;

  @ApiProperty({
    description: 'Descripción detallada del inconveniente registrado',
    example: 'La impresora no enciende y muestra una luz roja intermitente.',
  })
  @IsString()
  @IsNotEmpty()
  detalle: string;

  @ApiProperty({
    description: 'ID del equipo reportado',
    example: 3,
  })
  @IsInt()
  @IsNotEmpty()
  equipoId: number;

  @ApiPropertyOptional({
    description:
      'Indica si la incidencia corresponde a Software (true) o Hardware (false)',
    default: false,
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  esSoftware?: boolean;
}
