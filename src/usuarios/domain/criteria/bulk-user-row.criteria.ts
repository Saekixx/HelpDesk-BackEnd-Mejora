export const BULK_USER_COLUMNS = [
  'nombre',
  'apellido',
  'correo',
  'rol',
  'sucursal',
  'area',
] as const;

export type BulkUserColumn = (typeof BULK_USER_COLUMNS)[number];

export type BulkUserFileFormat = 'xlsx' | 'csv';

// Fila leída del archivo; `fila` es el número de fila en la hoja original (la 1 es el encabezado)
export type BulkUserRow = Record<BulkUserColumn, string> & { fila: number };
