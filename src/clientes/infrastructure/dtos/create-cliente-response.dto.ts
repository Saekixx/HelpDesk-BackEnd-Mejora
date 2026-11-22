import { ApiProperty } from '@nestjs/swagger';
import { CreateClienteResult } from '@/clientes/domain/entities/cliente.entity';

// Respuesta de POST /clientes (campo `data`)
export class CreateClienteResponseDto implements CreateClienteResult {
  @ApiProperty({ description: 'Identificador del cliente creado', example: 1 })
  id_cliente: number;

  @ApiProperty({
    description: 'Nombre o razón social del cliente',
    example: 'Acme Corp SAC',
  })
  nombre_principal: string;

  @ApiProperty({
    description: 'RUC (número de documento) del cliente',
    example: '20123456789',
  })
  ruc: string;

  @ApiProperty({
    description: 'Identificador de la sucursal principal creada',
    example: 1,
  })
  sucursal_principal_id: number;

  @ApiProperty({
    description: 'Identificador del usuario responsable creado',
    example: 12,
  })
  usuario_responsable_id: number;
}
