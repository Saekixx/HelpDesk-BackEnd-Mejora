import { ApiProperty } from '@nestjs/swagger';
import { EstadoHardware } from '@/hardware/domain/enums/estado-hardware.enum';
import { TipoComponente } from '@/hardware/domain/enums/tipo-componente.enum';

// Hardware tras actualizar su ficha técnica (PATCH /hardware/:id)
export class HardwareUpdateResponseDto {
  @ApiProperty({ description: 'ID del hardware', example: 7 })
  id_hardware: number;

  @ApiProperty({ description: 'Número de serie', example: 'SN-9876543210' })
  numero_serie: string;

  @ApiProperty({ description: 'Marca y modelo', example: 'Kingston Fury 16GB' })
  marca_modelo: string;

  @ApiProperty({
    description: 'Proveedor',
    example: 'TechSupply Peru S.A.C.',
    type: String,
    nullable: true,
  })
  proveedor: string | null;

  @ApiProperty({
    description: 'Fecha de compra',
    example: '2026-01-15T00:00:00.000Z',
    type: Date,
    nullable: true,
  })
  fecha_compra: Date | null;

  @ApiProperty({ description: 'Costo unitario (2 decimales)', example: 350.5 })
  costo_unitario: number;

  @ApiProperty({
    description: 'Factura de compra. null si no se adjuntó.',
    example: 'facturas/fac-001.pdf',
    type: String,
    nullable: true,
  })
  url_factura: string | null;

  @ApiProperty({
    description: 'Tipo de componente (clave)',
    enum: TipoComponente,
    enumName: 'TipoComponente',
    example: TipoComponente.MEMORIA_RAM,
  })
  tipo_componente: TipoComponente;

  @ApiProperty({
    description: 'Tipo de componente legible',
    example: 'Memoria RAM',
  })
  tipo_componente_label: string;

  @ApiProperty({
    description: 'Estado oficial del hardware (clave)',
    enum: EstadoHardware,
    enumName: 'EstadoHardware',
    example: EstadoHardware.INSTALADO,
  })
  estado: EstadoHardware;

  @ApiProperty({ description: 'Estado legible', example: 'Instalado' })
  estado_label: string;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2026-02-01T09:00:00.000Z',
  })
  updated_at: Date;
}
