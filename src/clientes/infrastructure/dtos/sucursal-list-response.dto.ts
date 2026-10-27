import { ApiProperty } from '@nestjs/swagger';

// Empresa (cliente) dueña de la sucursal
export class ClienteEmpresaResponseDto {
  @ApiProperty({ description: 'Identificador único del cliente', example: 1 })
  id_cliente: number;

  @ApiProperty({
    description: 'Nombre o razón social del cliente',
    example: 'Corporación ACME S.A.C.',
  })
  nombre: string;

  @ApiProperty({
    description: 'Número de documento (RUC/DNI) del cliente',
    example: '20123456789',
    nullable: true,
    type: String,
  })
  numero_documento: string | null;
}

// Usuario encargado de la sucursal
export class EncargadoSucursalResponseDto {
  @ApiProperty({ description: 'Identificador único del usuario', example: 12 })
  id_usuario: number;

  @ApiProperty({ description: 'Nombre del encargado', example: 'María' })
  nombre: string;

  @ApiProperty({ description: 'Apellido del encargado', example: 'Gómez' })
  apellido: string;

  @ApiProperty({
    description: 'Teléfono de contacto del encargado',
    example: '987654321',
    nullable: true,
    type: String,
  })
  telefono_contacto: string | null;

  @ApiProperty({
    description: 'Correo electrónico del encargado',
    example: 'maria.gomez@acme.com',
    nullable: true,
    type: String,
  })
  correo: string | null;
}

// Zona geográfica asignada a la sucursal
export class ZonaSucursalResponseDto {
  @ApiProperty({ description: 'Identificador único de la zona', example: 2 })
  id_zona: number;

  @ApiProperty({ description: 'Nombre de la zona', example: 'Lima Centro' })
  nombre: string;
}

// Item del listado de sucursales (GET /sucursales)
export class SucursalListItemResponseDto {
  @ApiProperty({
    description: 'Identificador único de la sucursal',
    example: 5,
  })
  id_sucursal: number;

  @ApiProperty({
    description: 'Nombre de la sucursal',
    example: 'Sede Miraflores',
  })
  nombre_sucursal: string;

  @ApiProperty({
    description: 'Dirección de la sucursal',
    example: 'Av. Larco 345, Miraflores',
  })
  direccion: string;

  @ApiProperty({
    description: 'Sucursal activa (true) o inactiva (false)',
    example: true,
  })
  is_active: boolean;

  @ApiProperty({
    description: 'Cantidad total de áreas de la sucursal',
    example: 3,
  })
  total_areas: number;

  @ApiProperty({
    description:
      'Empresa dueña de la sucursal. null si no tiene cliente asignado.',
    type: ClienteEmpresaResponseDto,
    nullable: true,
  })
  cliente_empresa: ClienteEmpresaResponseDto | null;

  @ApiProperty({
    description:
      'Usuario encargado de la sucursal. null si no tiene encargado asignado.',
    type: EncargadoSucursalResponseDto,
    nullable: true,
  })
  encargado: EncargadoSucursalResponseDto | null;

  @ApiProperty({
    description: 'Zona de la sucursal. null si no tiene zona asignada.',
    type: ZonaSucursalResponseDto,
    nullable: true,
  })
  zona: ZonaSucursalResponseDto | null;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2026-10-01T15:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2026-10-10T09:12:00.000Z',
  })
  updatedAt: Date;
}
