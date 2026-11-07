import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class AutoAssignResultDto {
  @ApiProperty({ description: 'ID del técnico asignado', example: 101 })
  @IsNumber()
  @IsNotEmpty()
  id_tecnico: number;

  @ApiProperty({
    description: 'Nombre del técnico asignado',
    example: 'Juan Pérez',
  })
  @IsNotEmpty()
  nombre_tecnico: string;

  @ApiProperty({
    description: 'Franja horaria recomendada para la cita',
    example: '09:00 - 12:00',
  })
  @IsNotEmpty()
  franja_recomendada: string;

  @ApiProperty({
    description: 'Motivo de la asignación',
    example: 'Técnico con menor carga de trabajo',
  })
  @IsNotEmpty()
  motivo_asignacion: string;

  @ApiProperty({
    description: 'Indica si la asignación fue agrupada por sucursal',
    example: true,
  })
  @IsNotEmpty()
  es_agrupado_por_sucursal: boolean;
}
