import { tipo_licencia_enum } from '@prisma/client';

export interface CreateSoftwareDto {
  id_cliente?: number;
  id_sucursal?: number;
  nombre_software: string;
  categoria?: string;
  tipo_licencia: tipo_licencia_enum;
  licencia_master_key?: string;
  proveedor?: string;
  limite_equipos?: number;
  url_factura?: string;
  fecha_compra?: Date | string;
  fecha_caducidad?: Date | string;
  is_active?: boolean;
}