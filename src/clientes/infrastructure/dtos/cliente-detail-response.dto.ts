import { ApiProperty } from '@nestjs/swagger';

export class PlanResponseDto {
  @ApiProperty({ description: 'Identificador del plan contratado', example: 1 })
  id_plan: number;

  @ApiProperty({ description: 'Nombre/tipo del plan', example: 'Plan Premium' })
  nombre: string;

  @ApiProperty({
    description: 'Tipo de plan tal como está registrado en el sistema',
    example: 'Plan Premium',
  })
  tipo: string;

  @ApiProperty({ description: 'Precio del plan', example: 250.0, required: false })
  precio?: number;

  @ApiProperty({
    description: 'Límite de equipos incluidos en el plan',
    example: 30,
    required: false,
  })
  limite_equipos?: number;

  @ApiProperty({ description: 'Si el plan está activo', example: true, required: false })
  is_active?: boolean;
}

export class SucursalDetailResponseDto {
  @ApiProperty({ description: 'Identificador de la sucursal', example: 1 })
  id_sucursal: number;

  @ApiProperty({ description: 'Nombre de la sucursal', example: 'Sucursal Central' })
  nombre: string;

  @ApiProperty({ description: 'Nombre del encargado de la sucursal', example: 'Juan Pérez' })
  encargado: string;

  @ApiProperty({ description: 'Teléfono de contacto de la sucursal', example: '+51987654321' })
  telefono: string;

  @ApiProperty({
    description: 'Correo de contacto de la sucursal',
    example: 'sucursal.central@acme.com',
  })
  correo: string;

  @ApiProperty({ description: 'Dirección de la sucursal', example: 'Jr. Los Pinos 456' })
  direccion: string;

  @ApiProperty({ description: 'Si la sucursal está activa', example: true })
  is_active: boolean;
}

export class ClienteDetailResponseDto {
  @ApiProperty({ description: 'Identificador único del cliente', example: 1, required: false })
  id_cliente?: number;

  @ApiProperty({
    description: 'Tipo de cliente',
    enum: ['JURIDICA', 'NATURAL'],
    example: 'JURIDICA',
  })
  tipo_cliente: string;

  @ApiProperty({ description: 'Número de documento (RUC/DNI)', example: '20123456789' })
  numero_documento: string;

  @ApiProperty({ description: 'Nombre o razón social principal', example: 'Acme Corp SAC' })
  nombre_principal: string;

  @ApiProperty({ description: 'Dirección principal del cliente', example: 'Av. Siempre Viva 123' })
  direccion: string;

  @ApiProperty({ description: 'Teléfono de contacto', example: '+51987654321' })
  telefono: string;

  @ApiProperty({ description: 'Correo de contacto', example: 'contacto@acme.com' })
  correo: string;

  @ApiProperty({ description: 'Rubro o giro del negocio', example: 'Retail' })
  rubro: string;

  @ApiProperty({
    description: 'Fecha de inicio del plan contratado',
    example: '2026-01-01',
  })
  fecha_inicio_plan: Date;

  @ApiProperty({
    description: 'Fecha de finalización del plan contratado',
    example: '2026-12-31',
  })
  fecha_finalizacion_plan: Date;

  @ApiProperty({ description: 'Costo negociado con el cliente', example: 1500.5 })
  costo_negociado: number;

  @ApiProperty({ description: 'Límite de equipos contratado', example: 20 })
  limite_equipos_contratado: number;

  @ApiProperty({ description: 'Si el cliente está activo', example: true })
  is_active: boolean;

  @ApiProperty({ description: 'Identificador del plan contratado', example: 1 })
  id_plan: number;

  @ApiProperty({
    description: 'Fecha de registro del cliente',
    example: '2026-01-01T00:00:00.000Z',
  })
  fecha_registro: Date;

  @ApiProperty({
    description: 'Fecha de creación del registro',
    example: '2026-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización del registro',
    example: '2026-01-01T00:00:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Plan contratado por el cliente (null si no tiene plan asignado)',
    type: PlanResponseDto,
    nullable: true,
  })
  plan: PlanResponseDto | null;

  @ApiProperty({
    description: 'Listado de sucursales registradas para el cliente',
    type: [SucursalDetailResponseDto],
  })
  sucursales: SucursalDetailResponseDto[];
}