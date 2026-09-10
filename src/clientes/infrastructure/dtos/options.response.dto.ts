import { ApiProperty } from '@nestjs/swagger';

export class OptionDto {
  @ApiProperty({
    description: 'Identificador único del registro',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Nombre o etiqueta descriptiva de la opción',
    example: 'Sucursal Central',
  })
  nombre: string;
}
