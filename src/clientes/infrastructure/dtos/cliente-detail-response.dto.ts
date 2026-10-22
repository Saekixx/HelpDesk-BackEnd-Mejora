import { ApiProperty } from '@nestjs/swagger';

// Respuesta de GET /clientes/:id: alimenta el modal "Detalle de Cliente / Empresa".

export class PlanDetailResponseDto {
  @ApiProperty({ description: 'Identificador del plan contratado', example: 1 })
  id_plan: number;

  @ApiProperty({
    description: 'Tipo de plan tal como está registrado en el sistema',
    example: 'Tech Enterprise',
  })
  tipo: string;

  @ApiProperty({
    description: 'Límite de equipos incluidos en el plan',
    example: 30,
  })
  limite_equipos: number;
}

export class ContactoEnlaceResponseDto {
  @ApiProperty({
    description: 'Nombre completo de la persona responsable del enlace',
    example: 'Carlos Mendoza',
  })
  nombre_responsable: string;

  @ApiProperty({
    description: 'Cargo de la persona de enlace dentro de la empresa',
    example: 'Representante de la empresa',
  })
  cargo: string;

  @ApiProperty({
    description: 'Correo de contacto',
    example: 'carlos.mendoza@acme.com',
  })
  correo: string;

  @ApiProperty({ description: 'Teléfono de contacto', example: '987654321' })
  telefono: string;
}

export class SucursalActivaResponseDto {
  @ApiProperty({ description: 'Identificador de la sucursal', example: 1 })
  id_sucursal: number;

  @ApiProperty({
    description:
      'Indica si es la sucursal principal (siempre se lista primero)',
    example: true,
  })
  is_principal: boolean;

  @ApiProperty({
    description: 'Nombre de la sucursal',
    example: 'Sede Central',
  })
  nombre: string;

  @ApiProperty({
    description: 'Dirección de la sucursal',
    example: 'Jr. Los Pinos 456',
  })
  direccion: string;

  @ApiProperty({
    description: 'Cantidad de equipos vinculados a la sucursal',
    example: 12,
  })
  total_equipos: number;
}

export class ClienteDetailResponseDto {
  @ApiProperty({ description: 'Identificador único del cliente', example: 1 })
  id_cliente: number;

  @ApiProperty({
    description: 'Nombre (persona natural) o razón social (persona jurídica)',
    example: 'Acme Corp SAC',
  })
  nombre_principal: string;

  @ApiProperty({
    description: 'Número de documento (RUC/DNI)',
    example: '20123456789',
  })
  numero_documento: string;

  @ApiProperty({
    description: 'Tipo de cliente',
    enum: ['JURIDICA', 'NATURAL'],
    example: 'JURIDICA',
  })
  tipo_cliente: string;

  @ApiProperty({
    description: 'Rubro o sector económico',
    example: 'Retail',
    nullable: true,
    type: String,
  })
  rubro: string | null;

  @ApiProperty({
    description: 'Dirección principal del cliente',
    example: 'Av. Siempre Viva 123',
    nullable: true,
    type: String,
  })
  direccion: string | null;

  @ApiProperty({
    description: 'Plan contratado (null si el cliente no tiene plan asignado)',
    type: PlanDetailResponseDto,
    nullable: true,
  })
  plan: PlanDetailResponseDto | null;

  @ApiProperty({
    description:
      'Contacto de enlace de la empresa (null si no hay un usuario representante activo)',
    type: ContactoEnlaceResponseDto,
    nullable: true,
  })
  contacto_enlace: ContactoEnlaceResponseDto | null;

  @ApiProperty({
    description:
      'Sucursales activas del cliente. La sucursal principal (is_principal: true) siempre aparece primero',
    type: [SucursalActivaResponseDto],
  })
  sucursales_activas: SucursalActivaResponseDto[];
}
