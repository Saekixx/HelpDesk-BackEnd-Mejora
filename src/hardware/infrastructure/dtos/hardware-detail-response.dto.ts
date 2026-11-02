import { ApiProperty } from '@nestjs/swagger';
import { EstadoHardware } from '@/hardware/domain/enums/estado-hardware.enum';
import { TipoComponente } from '@/hardware/domain/enums/tipo-componente.enum';

export class HardwareDetailClienteResponseDto {
  @ApiProperty({ description: 'ID del cliente', example: 1 })
  id_cliente: number;

  @ApiProperty({
    description: 'Nombre principal del cliente',
    example: 'Acme Corp SAC',
  })
  nombre_principal: string;
}

export class HardwareDetailSucursalResponseDto {
  @ApiProperty({ description: 'ID de la sucursal', example: 1 })
  id_sucursal: number;

  @ApiProperty({
    description: 'Nombre de la sucursal',
    example: 'Sucursal Central',
  })
  nombre_sucursal: string;
}

export class HardwareDetailAreaResponseDto {
  @ApiProperty({ description: 'ID del área', example: 1 })
  id_area: number;

  @ApiProperty({ description: 'Nombre del área', example: 'Sistemas' })
  nombre_area: string;
}

// Equipo donde está instalado actualmente el hardware y su ubicación
export class HardwareDetailEquipoActualResponseDto {
  @ApiProperty({ description: 'ID del equipo', example: 12 })
  id_equipo: number;

  @ApiProperty({ description: 'Código del equipo', example: 'EQ-12' })
  codigo: string;

  @ApiProperty({
    description: 'Nombre asignado al equipo',
    example: 'PC-Contabilidad-01',
    type: String,
    nullable: true,
  })
  nombre_equipo: string | null;

  @ApiProperty({ type: HardwareDetailClienteResponseDto, nullable: true })
  cliente: HardwareDetailClienteResponseDto | null;

  @ApiProperty({ type: HardwareDetailSucursalResponseDto, nullable: true })
  sucursal: HardwareDetailSucursalResponseDto | null;

  @ApiProperty({ type: HardwareDetailAreaResponseDto, nullable: true })
  area: HardwareDetailAreaResponseDto | null;
}

export class HardwareHistorialEquipoResponseDto {
  @ApiProperty({ description: 'ID del equipo', example: 12 })
  id_equipo: number;

  @ApiProperty({
    description: 'Nombre asignado al equipo',
    example: 'PC-Contabilidad-01',
    type: String,
    nullable: true,
  })
  nombre_equipo: string | null;
}

export class HardwareHistorialTecnicoResponseDto {
  @ApiProperty({ description: 'ID del usuario técnico', example: 4 })
  id_usuario: number;

  @ApiProperty({ description: 'Nombre del técnico', example: 'Carlos' })
  nombre: string;

  @ApiProperty({ description: 'Apellido del técnico', example: 'Ramírez' })
  apellido: string;
}

// Movimiento (instalación/retiro) de la hoja de vida del componente
export class HardwareHistorialResponseDto {
  @ApiProperty({ description: 'ID del registro de movimiento', example: 31 })
  id_RH: number;

  @ApiProperty({
    description: 'Fecha de instalación',
    example: '2026-01-20T10:30:00.000Z',
  })
  fecha_instalacion: Date;

  @ApiProperty({
    description: 'Fecha de retiro. null si sigue instalado.',
    example: null,
    type: Date,
    nullable: true,
  })
  fecha_retiro: Date | null;

  @ApiProperty({
    description: 'Motivo del retiro. null si sigue instalado.',
    example: null,
    type: String,
    nullable: true,
  })
  motivo_retiro: string | null;

  @ApiProperty({
    description: 'true en el movimiento vigente (instalado actualmente)',
    example: true,
  })
  is_actual: boolean;

  @ApiProperty({ type: HardwareHistorialEquipoResponseDto })
  equipo: HardwareHistorialEquipoResponseDto;

  @ApiProperty({
    description: 'Técnico que realizó el movimiento. null si no se registró.',
    type: HardwareHistorialTecnicoResponseDto,
    nullable: true,
  })
  tecnico_responsable: HardwareHistorialTecnicoResponseDto | null;
}

// Detalle del hardware (GET /hardware/:id): "Hoja de Vida del Componente"
export class HardwareDetailResponseDto {
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
    description: 'URL de la factura de compra. null si no se adjuntó.',
    example: 'https://storage.empresa.com/facturas/fac-001.pdf',
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
    description:
      'Equipo donde está instalado y su ubicación. null si no está asignado a ningún equipo.',
    type: HardwareDetailEquipoActualResponseDto,
    nullable: true,
  })
  equipo_actual: HardwareDetailEquipoActualResponseDto | null;

  @ApiProperty({
    description: 'Historial de movimientos (instalaciones y retiros)',
    type: [HardwareHistorialResponseDto],
  })
  historial: HardwareHistorialResponseDto[];

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
