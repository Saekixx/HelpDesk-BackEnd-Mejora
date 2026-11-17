import { ApiProperty } from '@nestjs/swagger';
import { EstadoEquipo } from '@/equipos/domain/enums/estado-equipo.enum';
import { TipoComponente } from '@/hardware/domain/enums/tipo-componente.enum';

export class EquipoDetailClienteDto {
  @ApiProperty({ description: 'ID del cliente', example: 1 })
  id_cliente: number;

  @ApiProperty({
    description: 'Nombre principal del cliente',
    example: 'Innovación Global Tech',
  })
  nombre_principal: string;
}

export class EquipoDetailSucursalDto {
  @ApiProperty({ description: 'ID de la sucursal', example: 1 })
  id_sucursal: number;

  @ApiProperty({
    description: 'Nombre de la sucursal',
    example: 'Sucursal Centro Civico',
  })
  nombre_sucursal: string;

  @ApiProperty({
    description: 'Dirección de la sucursal',
    example: 'Av. Garcilaso de la Vega 1234, Lima',
  })
  direccion: string;

  @ApiProperty({
    description: 'Nombre del encargado de la sucursal',
    example: 'Ana Torres',
  })
  encargado: string;
}

export class EquipoDetailAreaDto {
  @ApiProperty({ description: 'ID del área', example: 1 })
  id_area: number;

  @ApiProperty({ description: 'Nombre del área', example: 'Sistemas y TI' })
  nombre_area: string;
}

export class EquipoDetailTrabajadorDto {
  @ApiProperty({ description: 'ID del usuario', example: 5 })
  id_usuario: number;

  @ApiProperty({ description: 'Nombre del trabajador', example: 'María' })
  nombre: string;

  @ApiProperty({ description: 'Apellido del trabajador', example: 'Vargas' })
  apellido: string;

  @ApiProperty({
    description: 'Correo del trabajador',
    example: 'maria.sucursal2@empresa1.com',
    type: String,
    nullable: true,
  })
  correo: string | null;

  @ApiProperty({
    description: 'Teléfono del trabajador',
    example: '987654321',
    type: String,
    nullable: true,
  })
  telefono: string | null;
}

export class TecnicoResponsableDto {
  @ApiProperty({ description: 'ID del técnico', example: 9 })
  id_usuario: number;

  @ApiProperty({ description: 'Nombre del técnico', example: 'Luis' })
  nombre: string;

  @ApiProperty({ description: 'Apellido del técnico', example: 'Soto' })
  apellido: string;
}

export class ComponenteActualDto {
  @ApiProperty({
    description: 'ID del movimiento (registro_hardware)',
    example: 11,
  })
  id_RH: number;

  @ApiProperty({ description: 'ID del hardware', example: 7 })
  id_hardware: number;

  @ApiProperty({
    description: 'Tipo de componente (clave)',
    enum: TipoComponente,
    enumName: 'TipoComponente',
    example: TipoComponente.MEMORIA_RAM,
  })
  tipo_componente: TipoComponente;

  @ApiProperty({ description: 'Marca y modelo', example: 'Kingston Fury 16GB' })
  marca_modelo: string;

  @ApiProperty({ description: 'Número de serie', example: 'SN-9876543210' })
  numero_serie: string;

  @ApiProperty({
    description: 'Proveedor',
    example: 'TechSupply Peru S.A.C.',
    type: String,
    nullable: true,
  })
  proveedor: string | null;

  @ApiProperty({
    description: 'URL de la factura de compra',
    example: 'https://storage.empresa.com/facturas/fac-001.pdf',
    type: String,
    nullable: true,
  })
  url_factura: string | null;

  @ApiProperty({
    description: 'Estado de salud SMART reportado',
    example: 'OK',
    type: String,
    nullable: true,
  })
  salud_smart: string | null;

  @ApiProperty({
    description: 'Motivo de la instalación del componente',
    example: 'Ampliación de memoria por lentitud del equipo',
    type: String,
    nullable: true,
  })
  motivo_instalacion: string | null;

  @ApiProperty({
    description: 'Fecha de instalación',
    example: '2026-10-01T10:30:00.000Z',
  })
  fecha_instalacion: Date;

  @ApiProperty({
    description: 'Técnico que realizó la instalación',
    type: TecnicoResponsableDto,
    nullable: true,
  })
  tecnico_responsable: TecnicoResponsableDto | null;

  @ApiProperty({ description: 'Movimiento vigente', example: true })
  is_active: boolean;
}

export class ComponenteRetiradoDto {
  @ApiProperty({
    description: 'ID del movimiento (registro_hardware)',
    example: 6,
  })
  id_RH: number;

  @ApiProperty({ description: 'ID del hardware', example: 4 })
  id_hardware: number;

  @ApiProperty({
    description: 'Tipo de componente (clave)',
    enum: TipoComponente,
    enumName: 'TipoComponente',
    example: TipoComponente.MEMORIA_RAM,
  })
  tipo_componente: TipoComponente;

  @ApiProperty({ description: 'Marca y modelo', example: 'Generic 8GB' })
  marca_modelo: string;

  @ApiProperty({ description: 'Número de serie', example: 'SN-1100234988' })
  numero_serie: string;

  @ApiProperty({
    description: 'Proveedor',
    example: 'TechSupply Peru S.A.C.',
    type: String,
    nullable: true,
  })
  proveedor: string | null;

  @ApiProperty({
    description: 'Fecha de instalación',
    example: '2026-03-15T09:00:00.000Z',
  })
  fecha_instalacion: Date;

  @ApiProperty({
    description: 'Fecha de retiro',
    example: '2026-10-01T10:30:00.000Z',
    type: Date,
    nullable: true,
  })
  fecha_retiro: Date | null;

  @ApiProperty({
    description: 'Motivo del retiro',
    example: 'Falla detectada en pruebas de memoria',
    type: String,
    nullable: true,
  })
  motivo_retiro: string | null;

  @ApiProperty({
    description: 'Técnico responsable del movimiento',
    type: TecnicoResponsableDto,
    nullable: true,
  })
  tecnico_responsable: TecnicoResponsableDto | null;

  @ApiProperty({ description: 'Movimiento vigente', example: false })
  is_active: boolean;
}

export class HardwareEquipoDto {
  @ApiProperty({
    description: 'Componentes instalados actualmente',
    type: [ComponenteActualDto],
  })
  componentes_actuales: ComponenteActualDto[];

  @ApiProperty({
    description: 'Componentes retirados del equipo',
    type: [ComponenteRetiradoDto],
  })
  historial: ComponenteRetiradoDto[];
}

export class SoftwareAsignadoDto {
  @ApiProperty({ description: 'ID de la asignación', example: 4 })
  id_software_equipos: number;

  @ApiProperty({ description: 'ID del software en el catálogo', example: 2 })
  id_software: number;

  @ApiProperty({
    description: 'Nombre del software',
    example: 'Microsoft Office 365',
  })
  nombre_software: string;

  @ApiProperty({
    description: 'Categoría del software',
    example: 'Ofimática',
    type: String,
    nullable: true,
  })
  categoria: string | null;

  @ApiProperty({
    description: 'Tipo de licencia (clave del enum)',
    example: 'Pool_Limitado',
  })
  tipo_licencia: string;

  @ApiProperty({
    description: 'Licencia asignada a este equipo',
    example: 'XXXXX-XXXXX-XXXXX',
    type: String,
    nullable: true,
  })
  licencia_asignada: string | null;

  @ApiProperty({
    description: 'Correo asociado a la licencia',
    example: 'licencias@empresa1.com',
    type: String,
    nullable: true,
  })
  correo_asociado: string | null;

  @ApiProperty({
    description:
      'Contraseña de la licencia. Solo el ADMINISTRADOR la recibe; para los demás roles viene enmascarada como "**********" (null si no tiene contraseña).',
    example: '**********',
    type: String,
    nullable: true,
  })
  password_enc: string | null;

  @ApiProperty({
    description: 'Fecha de instalación',
    example: '2026-10-02T08:00:00.000Z',
    type: Date,
    nullable: true,
  })
  fecha_instalacion: Date | null;

  @ApiProperty({
    description:
      'Vencimiento de la licencia (el de la asignación o, si no tiene, el del catálogo)',
    example: '2027-01-01T00:00:00.000Z',
    type: Date,
    nullable: true,
  })
  vencimiento: Date | null;

  @ApiProperty({
    description: 'Observaciones',
    example: 'Licencia renovada anualmente',
    type: String,
    nullable: true,
  })
  observaciones: string | null;

  @ApiProperty({ description: 'Asignación activa', example: true })
  is_active: boolean;
}

// Hoja de Vida del Equipo (GET /equipos/:id)
export class EquipoDetailResponseDto {
  @ApiProperty({ description: 'ID del equipo', example: 3 })
  id_equipo: number;

  @ApiProperty({
    description: 'TAG del equipo',
    example: 'PC-DELL-90',
    type: String,
    nullable: true,
  })
  nombre_equipo: string | null;

  @ApiProperty({ description: 'Tipo de equipo', example: 'Desktop' })
  tipo: string;

  @ApiProperty({
    description: 'Marca y modelo',
    example: 'Dell Latitude 5540',
    type: String,
    nullable: true,
  })
  marca_modelo: string | null;

  @ApiProperty({
    description: 'Estado operativo del equipo',
    enum: EstadoEquipo,
    enumName: 'EstadoEquipo',
    example: EstadoEquipo.ACTIVO,
  })
  estado: EstadoEquipo;

  @ApiProperty({
    description: 'Número de serie',
    example: 'SN-2026-00123',
    type: String,
    nullable: true,
  })
  num_serie: string | null;

  @ApiProperty({
    description: 'Fecha de la última revisión',
    example: '2026-09-01T00:00:00.000Z',
    type: Date,
    nullable: true,
  })
  ult_revision: Date | null;

  @ApiProperty({
    description: 'Fecha de la próxima revisión programada',
    example: '2027-03-01T00:00:00.000Z',
    type: Date,
    nullable: true,
  })
  rev_programada: Date | null;

  @ApiProperty({
    description: 'Equipo activo (no dado de baja)',
    example: true,
  })
  is_active: boolean;

  @ApiProperty({
    description: 'Fecha de registro',
    example: '2026-11-01T15:00:00.000Z',
    type: Date,
    nullable: true,
  })
  created_at: Date | null;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2026-11-10T09:30:00.000Z',
    type: Date,
    nullable: true,
  })
  updated_at: Date | null;

  @ApiProperty({ type: EquipoDetailClienteDto, nullable: true })
  cliente: EquipoDetailClienteDto | null;

  @ApiProperty({ type: EquipoDetailSucursalDto, nullable: true })
  sucursal: EquipoDetailSucursalDto | null;

  @ApiProperty({ type: EquipoDetailAreaDto, nullable: true })
  area: EquipoDetailAreaDto | null;

  @ApiProperty({
    description: 'Trabajador asignado. null si el equipo no está asignado.',
    type: EquipoDetailTrabajadorDto,
    nullable: true,
  })
  trabajador: EquipoDetailTrabajadorDto | null;

  @ApiProperty({ type: HardwareEquipoDto })
  hardware: HardwareEquipoDto;

  @ApiProperty({
    description: 'Licencias de software asignadas al equipo',
    type: [SoftwareAsignadoDto],
  })
  software: SoftwareAsignadoDto[];
}
