export class EquipoVinculadoDto {
  id_equipo: number;
  nombre_equipo: string;
  tipo: string;
  marca_modelo: string;
  num_serie: string;
}

export class SoftwareEquipoDetalleDto {
  id_software_equipos: number;
  correo_asociado?: string | null;
  licencia_especifica?: string | null;
  fecha_instalacion?: Date | null;
  observaciones?: string | null;
  equipos: EquipoVinculadoDto;
}

export class SoftwareVaultResponseDto {
  id_software: number;
  id_cliente: number;
  id_sucursal: number;
  nombre_software: string;
  limite_equipos: number;
  licencias_usadas: number;
  licencia_master_key?: string | null;
  software_equipos: SoftwareEquipoDetalleDto[];
}
