export class AreaResponseDto {
  id_area: number;
  codigo_area: string;
  nombre_area: string;
  id_sucursal: number;
  nombre_sucursal?: string;
  nombre_empresa?: string;
  contacto_responsable?: string | null;
  telefono?: string | null;
  correo_electronico?: string | null;
  is_active: boolean;
  total_equipos?: number;
  total_tickets?: number;
  created_at?: Date;
  updated_at?: Date;
}