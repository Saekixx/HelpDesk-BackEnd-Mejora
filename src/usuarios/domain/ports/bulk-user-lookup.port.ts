import {
  BulkAreaLookup,
  BulkSucursalLookup,
} from '../criteria/bulk-user-lookup.criteria';

// Token único para la Inyección de Dependencias en NestJS
export const BULK_USER_LOOKUP_PORT = 'BULK_USER_LOOKUP_PORT';

// Consultas de referencia (empresa, sucursales, áreas) usadas al pre-validar una carga masiva
export interface BulkUserLookupPort {
  existsCliente(idCliente: number): Promise<boolean>;

  // Sucursales que pertenecen estrictamente a la empresa indicada
  findSucursalesByCliente(idCliente: number): Promise<BulkSucursalLookup[]>;

  // Áreas de las sucursales indicadas
  findAreasBySucursales(sucursalIds: number[]): Promise<BulkAreaLookup[]>;
}
