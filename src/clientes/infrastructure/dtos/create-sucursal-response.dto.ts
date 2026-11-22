import { ApiProperty } from '@nestjs/swagger';
import { CreateSucursalResult } from '@/clientes/domain/entities/sucursal.entity';

// Respuesta de POST /sucursales (campo `data`)
export class CreateSucursalResponseDto implements CreateSucursalResult {
  @ApiProperty({
    description: 'Identificador de la sucursal creada',
    example: 7,
  })
  id_sucursal: number;

  @ApiProperty({
    description: 'Nombre de la sucursal creada',
    example: 'Sucursal Centro',
  })
  nombre_sucursal: string;

  @ApiProperty({
    description: 'Identificador del usuario encargado creado',
    example: 25,
  })
  usuario_encargado_id: number;
}
