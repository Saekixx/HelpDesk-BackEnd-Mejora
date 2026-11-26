export interface UpdateSoftwareDto {
  nombre_software?: string;
  categoria?: string;
  id_cliente?: number;
  id_sucursal?: number;
  tipo_licencia?: string;
  limite_equipos?: number;
  proveedor?: string;
  fecha_compra?: Date | string;
  fecha_caducidad?: Date | string;
  licencia_master_key?: string;
}
