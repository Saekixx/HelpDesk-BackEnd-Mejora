import { ApiProperty } from '@nestjs/swagger';
import { EstadoHardware } from '@/hardware/domain/enums/estado-hardware.enum';

// Referencia resumida a una entidad relacionada (cliente, sucursal, área).
export class HardwareRelacionResponseDto {
  @ApiProperty({ description: 'ID de la entidad relacionada', example: 1 })
  id: number;

  @ApiProperty({
    description: 'Nombre legible de la entidad relacionada',
    example: 'Acme Corp SAC',
  })
  nombre: string;
}

// Equipo donde está instalado el hardware y su ubicación
export class HardwareEquipoActualResponseDto {
  @ApiProperty({ description: 'ID del equipo', example: 12 })
  id_equipo: number;

  @ApiProperty({ description: 'Código del equipo', example: 'EQ-12' })
  codigo: string;

  @ApiProperty({
    description: 'Nombre asignado al equipo',
    example: 'PC-Contabilidad-01',
    nullable: true,
  })
  nombre_equipo: string | null;

  @ApiProperty({
    description: 'Cliente (empresa) dueño del equipo',
    type: HardwareRelacionResponseDto,
    nullable: true,
  })
  cliente: HardwareRelacionResponseDto | null;

  @ApiProperty({
    description: 'Sucursal donde está el equipo',
    type: HardwareRelacionResponseDto,
    nullable: true,
  })
  sucursal: HardwareRelacionResponseDto | null;

  @ApiProperty({
    description: 'Área donde está el equipo',
    type: HardwareRelacionResponseDto,
    nullable: true,
  })
  area: HardwareRelacionResponseDto | null;
}

// Item del listado de hardware (GET /hardware) y detalle (GET /hardware/:id)
export class HardwareResponseDto {
  @ApiProperty({ description: 'ID del hardware', example: 7 })
  id_hardware: number;

  @ApiProperty({ description: 'Número de serie', example: 'SN-9876543210' })
  numero_serie: string;

  @ApiProperty({
    description: 'Tipo de componente',
    example: 'Memoria RAM',
  })
  tipo_equipo: string;

  @ApiProperty({ description: 'Marca y modelo', example: 'Kingston Fury 16GB' })
  marca: string;

  @ApiProperty({
    description: 'Proveedor',
    example: 'TechSupply Peru S.A.C.',
  })
  proveedor: string;

  @ApiProperty({
    description: 'Fecha de compra',
    example: '2026-01-15T00:00:00.000Z',
  })
  fecha_compra: Date;

  @ApiProperty({
    description: 'URL de la factura de compra',
    example: 'https://storage.empresa.com/facturas/fac-001.pdf',
    required: false,
  })
  url_factura?: string;

  @ApiProperty({
    description: 'Estado oficial del hardware',
    enum: EstadoHardware,
    enumName: 'EstadoHardware',
    example: EstadoHardware.INSTALADO,
  })
  estado: EstadoHardware;

  @ApiProperty({
    description: 'Estado en texto legible para mostrar en la tabla',
    example: 'Instalado',
  })
  estado_label: string;

  @ApiProperty({
    description: 'true cuando el estado es INSTALADO',
    example: true,
  })
  is_active: boolean;

  @ApiProperty({
    description:
      'Equipo donde está instalado y su ubicación. null si no está asignado a ningún equipo.',
    type: HardwareEquipoActualResponseDto,
    nullable: true,
  })
  equipo_actual: HardwareEquipoActualResponseDto | null;

  @ApiProperty({
    description: 'Fecha de registro',
    example: '2026-01-20T10:30:00.000Z',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2026-02-01T09:00:00.000Z',
  })
  updated_at: Date;
}

// Metadatos de paginación
export class HardwarePaginationMetaResponseDto {
  @ApiProperty({
    description: 'Total de registros que cumplen el filtro',
    example: 42,
  })
  total: number;

  @ApiProperty({ description: 'Página actual', example: 1 })
  page: number;

  @ApiProperty({ description: 'Registros por página', example: 10 })
  limit: number;

  @ApiProperty({ description: 'Total de páginas', example: 5 })
  totalPages: number;
}

// Cuerpo de `data` en la respuesta paginada: { data: [...], meta: {...} }
export class PaginatedHardwareResponseDto {
  @ApiProperty({ type: [HardwareResponseDto] })
  data: HardwareResponseDto[];

  @ApiProperty({ type: HardwarePaginationMetaResponseDto })
  meta: HardwarePaginationMetaResponseDto;
}
