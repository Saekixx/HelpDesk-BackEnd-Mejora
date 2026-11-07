import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CerrarTicketDto {
  @ApiProperty({
    description: 'Reporte técnico de la solución aplicada',
    example: 'Se reinstaló el controlador de red y se verificó conectividad.',
  })
  @IsString()
  @IsNotEmpty()
  reporte_cierre: string;

  @ApiProperty({
    description: 'ID del usuario (técnico o soporte) que realiza el cierre',
    example: 3,
  })
  @IsNumber()
  @IsNotEmpty()
  id_usuario: number;

  @ApiProperty({
    description: 'Tipo de intervención realizada: REMOTO o INSITU',
    example: 'REMOTO',
    required: false,
  })
  @IsString()
  @IsOptional()
  tipo_intervencion?: 'REMOTO' | 'INSITU';

  @ApiProperty({
    description:
      'Datos opcionales de la cita in-situ si el cierre incluyó visita presencial',
    required: false,
  })
  @IsOptional()
  cita_insitu?: {
    id_cita: number;
    fecha_programada: string;
    estado_cita: string;
    observaciones: string;
    id_tecnico: number;
  };
}
