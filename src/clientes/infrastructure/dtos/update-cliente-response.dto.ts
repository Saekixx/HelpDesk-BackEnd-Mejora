import { ApiProperty } from '@nestjs/swagger';
import { UpdateClienteResult } from '@/clientes/domain/entities/cliente.entity';

// Respuesta de PATCH /clientes/:id (campo `data`)
export class UpdateClienteResponseDto implements UpdateClienteResult {
  @ApiProperty({
    description: 'Identificador del cliente actualizado',
    example: 1,
  })
  id_cliente: number;

  @ApiProperty({
    description: 'Razón Social (o nombre) vigente del cliente',
    example: 'Acme Corp SAC',
  })
  nombre_principal: string;

  @ApiProperty({
    description: 'Número de documento (RUC/DNI) vigente del cliente',
    example: '20123456789',
  })
  numero_documento: string;

  @ApiProperty({
    description: 'Rubro o sector económico vigente del cliente',
    example: 'Retail',
    type: String,
    nullable: true,
  })
  rubro: string | null;

  @ApiProperty({
    description: 'ID del plan de soporte vigente del cliente',
    example: 1,
    type: Number,
    nullable: true,
  })
  id_plan: number | null;
}
