import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ReabrirTicketDto {
  @ApiProperty({
    description:
      'Motivo o justificación por la cual se reabre el ticket debido a una reincidencia',
    example:
      'El error de expiración de licencia volvió a aparecer al reiniciar el equipo.',
  })
  @IsString({
    message: 'El motivo de reapertura debe ser una cadena de texto.',
  })
  @IsNotEmpty({ message: 'El motivo de reapertura es obligatorio.' })
  motivo_reapertura: string;
}
