export interface UpdateSoftwareDto {
  nombre_software?: string;
  licencia?: string;
  correo?: string;
  password?: string;
  fecha_instalacion?: Date | string;
  fecha_caducidad?: Date | string;
  proveedor?: string;
  is_active?: boolean;
}