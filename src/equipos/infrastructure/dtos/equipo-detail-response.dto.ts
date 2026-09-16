import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Referencia resumida a una entidad relacionada (cliente, sucursal, área,
// trabajador). Equivale a RelacionSummary del dominio.
export class RelacionResumenDto {
  @ApiProperty({ description: 'ID de la entidad relacionada', example: 1 })
  id: number;

  @ApiProperty({
    description: 'Nombre legible de la entidad relacionada',
    example: 'Acme Corp SAC',
  })
  nombre: string;
}

// Un componente de hardware registrado para el equipo. La misma forma se
// usa tanto para `componentes_actuales` (is_active = true) como para
// `historial` (is_active = false); lo único que cambia es el filtro.
export class ComponenteHardwareDto {
  @ApiProperty({ description: 'ID del registro de hardware', example: 12 })
  id_RH: number;

  @ApiPropertyOptional({
    description: 'Tipo de componente',
    example: 'Procesador',
    nullable: true,
  })
  tipo: string | null;

  @ApiPropertyOptional({
    description: 'Marca del componente',
    example: 'Intel',
    nullable: true,
  })
  marca: string | null;

  @ApiProperty({
    description: 'Descripción del componente',
    example: 'Intel Core i7-12700H 2.3GHz',
  })
  descripcion: string;

  @ApiProperty({
    description: 'Número de serie del componente',
    example: 'CPU-8842-XT',
  })
  serie: string;

  @ApiProperty({
    description: 'Proveedor que suministró el componente',
    example: 'Importaciones TechPeru SAC',
  })
  proveedor: string;

  @ApiProperty({
    description: 'Fecha de instalación del componente',
    example: '2026-03-14T10:30:00.000Z',
  })
  fecha_instalacion: Date;

  @ApiPropertyOptional({
    description: 'URL del PDF de la factura de compra del componente',
    example: 'https://storage.helpdesk.com/facturas/f-8842.pdf',
    nullable: true,
  })
  url_factura: string | null;

  @ApiProperty({
    description:
      'true = componente actualmente instalado; false = componente retirado (historial)',
    example: true,
  })
  is_active: boolean;
}

// Agrupa los componentes de hardware del equipo separados en dos pestañas:
// los que siguen instalados y los ya retirados.
export class HardwareEquipoDto {
  @ApiProperty({
    description: 'Componentes actualmente instalados (is_active = true)',
    type: [ComponenteHardwareDto],
  })
  componentes_actuales: ComponenteHardwareDto[];

  @ApiProperty({
    description: 'Componentes retirados / reemplazados (is_active = false)',
    type: [ComponenteHardwareDto],
  })
  historial: ComponenteHardwareDto[];
}

// Software instalado en el equipo. Combina los datos del catálogo
// (`software`) con los de la asignación al equipo (`software_equipos`).
export class SoftwareEquipoDto {
  @ApiProperty({
    description: 'ID de la relación software-equipo',
    example: 7,
  })
  id_software_equipos: number;

  @ApiProperty({ description: 'ID del software en el catálogo', example: 3 })
  id_software: number;

  @ApiProperty({
    description: 'Nombre del software',
    example: 'Microsoft Office 365',
  })
  nombre: string;

  @ApiProperty({
    description:
      'Fecha de caducidad de la licencia del software (columna fecha_caducidad)',
    example: '2027-01-31T00:00:00.000Z',
  })
  vencimiento: Date;

  @ApiPropertyOptional({
    description:
      'Licencia asignada específicamente a este equipo. Si es null, se usa la licencia general del catálogo.',
    example: 'XXXXX-YYYYY-ZZZZZ-11111',
    nullable: true,
  })
  licencia_asignada: string | null;

  @ApiPropertyOptional({
    description: 'Fecha en que se instaló el software en este equipo',
    example: '2026-02-01T09:15:00.000Z',
    nullable: true,
  })
  fecha_instalacion: Date | null;

  @ApiPropertyOptional({
    description: 'Observaciones sobre esta instalación',
    example: 'Instalado con perfil corporativo del cliente.',
    nullable: true,
  })
  observaciones: string | null;

  @ApiProperty({
    description: 'Indica si la asignación del software sigue vigente',
    example: true,
  })
  is_active: boolean;
}

// Respuesta completa de GET /equipos/:id
export class EquipoDetailResponseDto {
  @ApiProperty({ description: 'ID del equipo', example: 1042 })
  id_equipo: number;

  @ApiProperty({
    description:
      'Código legible del equipo. Es un valor derivado de id_equipo (no existe como columna en la base de datos).',
    example: 'EQ-1042',
  })
  codigo: string;

  @ApiProperty({ description: 'Tipo de equipo', example: 'Laptop' })
  tipo: string;

  @ApiProperty({ description: 'Marca del equipo', example: 'Dell' })
  marca: string;

  @ApiPropertyOptional({
    description: 'Número de serie del equipo',
    example: 'SN-2026-00123',
    nullable: true,
  })
  num_serie: string | null;

  @ApiPropertyOptional({
    description:
      'Nombre del usuario final del equipo, tal como fue registrado en texto libre.',
    example: 'Carlos Ramírez',
    nullable: true,
  })
  nombre_usuario: string | null;

  @ApiPropertyOptional({
    description: 'Fecha de la última revisión técnica',
    example: '2026-08-20T00:00:00.000Z',
    nullable: true,
  })
  ult_revision: Date | null;

  @ApiPropertyOptional({
    description: 'Fecha de la próxima revisión programada',
    example: '2026-11-20T00:00:00.000Z',
    nullable: true,
  })
  rev_programada: Date | null;

  @ApiProperty({ description: 'Estado activo del equipo', example: true })
  is_active: boolean;

  @ApiPropertyOptional({
    description: 'Cliente (empresa) propietario del equipo',
    type: RelacionResumenDto,
    nullable: true,
  })
  cliente: RelacionResumenDto | null;

  @ApiPropertyOptional({
    description: 'Sucursal donde se encuentra el equipo',
    type: RelacionResumenDto,
    nullable: true,
  })
  sucursal: RelacionResumenDto | null;

  @ApiPropertyOptional({
    description: 'Área donde se encuentra el equipo',
    type: RelacionResumenDto,
    nullable: true,
  })
  area: RelacionResumenDto | null;

  @ApiPropertyOptional({
    description: 'Trabajador (usuario) al que está asignado el equipo',
    type: RelacionResumenDto,
    nullable: true,
  })
  trabajador: RelacionResumenDto | null;

  @ApiProperty({
    description: 'Componentes de hardware, separados en actuales e historial',
    type: HardwareEquipoDto,
  })
  hardware: HardwareEquipoDto;

  @ApiProperty({
    description: 'Software instalado en el equipo',
    type: [SoftwareEquipoDto],
  })
  software: SoftwareEquipoDto[];
}