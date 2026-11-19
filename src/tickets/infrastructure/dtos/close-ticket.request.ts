import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CerrarTicketDto {
  @ApiProperty({
    description: 'Reporte técnico de la solución aplicada',
    example: 'Se reinstaló el controlador de red y se verificó conectividad.',
  })
  @IsString()
  @IsNotEmpty()
  reporte_cierre: string;
}
