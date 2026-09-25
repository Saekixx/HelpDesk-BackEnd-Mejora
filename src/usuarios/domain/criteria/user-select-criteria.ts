export enum UserRole {
  ADMINISTRADOR = 'ADMINISTRADOR',
  SOPORTE_TECNICO = 'SOPORTE_TECNICO',
  SOPORTE_INSITU = 'SOPORTE_INSITU',
  CLIENTE_EMPRESA = 'CLIENTE_EMPRESA',
  CLIENTE_SUCURSAL = 'CLIENTE_SUCURSAL',
  CLIENTE_TRABAJADOR = 'CLIENTE_TRABAJADOR',
}

export interface UserSelectCriteria {
  search?: string;
  id_sucursal?: number;
  id_area?: number;
  id_cliente?: number;
  rol?: UserRole;
}
