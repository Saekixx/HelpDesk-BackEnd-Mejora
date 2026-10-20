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

// Máximo de filas por carga masiva (validación y procesamiento)
export const MAX_BULK_ROWS = 1000;
