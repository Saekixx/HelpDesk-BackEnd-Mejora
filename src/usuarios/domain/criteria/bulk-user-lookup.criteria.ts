// Datos mínimos de una sucursal necesarios para validar la carga masiva
export interface BulkSucursalLookup {
  id_sucursal: number;
  nombre_sucursal: string;
}

// Datos mínimos de un área necesarios para validar la carga masiva
export interface BulkAreaLookup {
  id_area: number;
  nombre_area: string;
  id_sucursal: number;
}
