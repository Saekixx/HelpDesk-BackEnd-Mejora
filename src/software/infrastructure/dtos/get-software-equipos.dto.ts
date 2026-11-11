import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EquipoVinculadoDto {
  @ApiProperty({ example: 12, description: 'ID único del equipo' })
  id_equipo: number;

  @ApiProperty({
    example: 'PC-FIN-001',
    description: 'Nombre o código del equipo',
  })
  nombre_equipo: string;

  @ApiProperty({
    example: 'Desktop',
    description: 'Tipo de equipo (Laptop, Desktop, etc.)',
  })
  tipo: string;

  @ApiProperty({
    example: 'DELL-7090',
    description: 'Marca y modelo del equipo',
  })
  marca_modelo: string;

  @ApiProperty({
    example: 'DL-889900',
    description: 'Número de serie del equipo',
  })
  num_serie: string;
}

export class SoftwareEquipoDetalleDto {
  @ApiProperty({
    example: 101,
    description: 'ID de la relación software-equipo',
  })
  id_software_equipos: number;

  @ApiPropertyOptional({
    example: 'cmendoza@metropolis.com',
    description: 'Correo asociado a la licencia en este equipo',
  })
  correo_asociado?: string | null;

  @ApiPropertyOptional({
    example: '.....-9201',
    description: 'Licencia o credencial específica asignada',
  })
  licencia_especifica?: string | null;

  @ApiPropertyOptional({
    example: '2024-01-15T00:00:00.000Z',
    description: 'Fecha de instalación o asignación',
  })
  fecha_instalacion?: Date | null;

  @ApiPropertyOptional({
    example: 'Activo sin incidencias',
    description: 'Observaciones del despliegue',
  })
  observaciones?: string | null;

  @ApiProperty({
    type: EquipoVinculadoDto,
    description: 'Datos detallados del equipo vinculado',
  })
  equipos: EquipoVinculadoDto;
}

export class SoftwareVaultResponseDto {
  @ApiProperty({ example: 1, description: 'ID único del software' })
  id_software: number;

  @ApiProperty({
    example: 5,
    description: 'ID del cliente propietario del software',
  })
  id_cliente: number;

  @ApiProperty({
    example: 10,
    description: 'ID de la sucursal donde se encuentra el software',
  })
  id_sucursal: number;

  @ApiProperty({
    example: 'Microsoft 365 Enterprise E5',
    description: 'Nombre del software',
  })
  nombre_software: string;

  @ApiProperty({
    example: 50,
    description: 'Capacidad total o límite de equipos contratados',
  })
  limite_equipos: number;

  @ApiProperty({
    example: 45,
    description: 'Cantidad de cupos o licencias en uso actualmente',
  })
  licencias_usadas: number;

  @ApiPropertyOptional({
    example: 'MS365-ENT-4920...',
    description: 'Clave maestra o Master Key del software',
  })
  licencia_master_key?: string | null;

  @ApiProperty({
    type: [SoftwareEquipoDetalleDto],
    description:
      'Lista de los equipos y credenciales vinculados a este software',
  })
  software_equipos: SoftwareEquipoDetalleDto[];
}
