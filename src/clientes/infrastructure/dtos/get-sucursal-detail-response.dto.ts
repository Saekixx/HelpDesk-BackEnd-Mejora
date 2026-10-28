import { ApiProperty } from '@nestjs/swagger';

// Área vinculada a la sucursal
export class SucursalAreaDetailResponseDto {
  @ApiProperty({ description: 'Identificador único del área', example: 8 })
  id_area: number;

  @ApiProperty({ description: 'Nombre del área', example: 'Contabilidad' })
  nombre_area: string;

  @ApiProperty({
    description: 'Área activa (true) o inactiva (false)',
    example: true,
  })
  is_active: boolean;
}

// Empresa (cliente) dueña de la sucursal
export class SucursalClienteEmpresaResponseDto {
  @ApiProperty({ description: 'Identificador único del cliente', example: 1 })
  id_cliente: number;

  @ApiProperty({
    description: 'Nombre principal o razón social del cliente',
    example: 'Corporación ACME S.A.C.',
  })
  nombre_principal: string;

  @ApiProperty({
    description: 'Número de documento (RUC/DNI) del cliente',
    example: '20123456789',
    nullable: true,
    type: String,
  })
  numero_documento: string | null;
}

// Encargado de la sucursal
export class SucursalEncargadoDetailResponseDto {
  @ApiProperty({ description: 'Identificador único del usuario', example: 12 })
  id_usuario: number;

  @ApiProperty({ description: 'Nombre del encargado', example: 'María' })
  nombre: string;

  @ApiProperty({ description: 'Apellido del encargado', example: 'Gómez' })
  apellido: string;

  @ApiProperty({
    description: 'Teléfono de contacto de la sucursal',
    example: '987654321',
  })
  telefono_contacto: string;

  @ApiProperty({
    description: 'Correo corporativo de la sucursal',
    example: 'miraflores@acme.com',
  })
  correo_corporativo: string;
}

// Detalle de la sucursal (GET /sucursales/:id)
export class GetSucursalDetailResponseDto {
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
    description: 'Sucursal activa (true) o inactiva (false)',
    example: true,
  })
  is_active: boolean;

  @ApiProperty({
    description: 'Dirección de la sucursal',
    example: 'Av. Larco 345, Miraflores',
  })
  direccion: string;

  @ApiProperty({
    description: 'Identificador de la zona. null si no tiene zona asignada.',
    example: 2,
    nullable: true,
    type: Number,
  })
  id_zona: number | null;

  @ApiProperty({
    description: 'Áreas vinculadas a la sucursal',
    type: [SucursalAreaDetailResponseDto],
  })
  areasVinculadas: SucursalAreaDetailResponseDto[];

  @ApiProperty({
    description:
      'Empresa dueña de la sucursal. null si no tiene cliente asignado.',
    type: SucursalClienteEmpresaResponseDto,
    nullable: true,
  })
  clienteEmpresa: SucursalClienteEmpresaResponseDto | null;

  @ApiProperty({
    description:
      'Encargado de la sucursal. null si no tiene usuarios vinculados.',
    type: SucursalEncargadoDetailResponseDto,
    nullable: true,
  })
  encargado: SucursalEncargadoDetailResponseDto | null;

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
