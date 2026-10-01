export interface UpdateHardwareDto {
  tipo_equipo?: string;
  numero_serie?: string;
  fecha_compra?: Date | string;
  marca?: string;
  proveedor?: string;
  url_factura?: string;
  descripcion?: string;
  ult_revision?: Date | string;
  rev_programada?: Date | string;
  is_active?: boolean;
}