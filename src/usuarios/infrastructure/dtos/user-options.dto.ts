import { ApiProperty } from '@nestjs/swagger';

export class UserOptions {
  @ApiProperty({
    description: 'ID del usuario',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Nombre completo concatenado del trabajador',
    example: 'Juan Pérez',
  })
  nombre: string;
}
