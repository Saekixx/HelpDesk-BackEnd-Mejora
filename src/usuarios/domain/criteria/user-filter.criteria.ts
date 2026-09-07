export interface UserFilterCriteria {
  search?: string;
  id_rol?: number;
  id_cliente?: number;
  id_sucursal?: number;
  id_area?: number;
  is_active?: boolean;
  page?: number;
  limit?: number;
}
