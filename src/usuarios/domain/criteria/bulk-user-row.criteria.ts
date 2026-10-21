// Orden de las columnas en la hoja "Usuarios" de la plantilla (A..H)
export const BULK_USER_COLUMNS = [
  'nombre',
  'apellido',
  'correo',
  'rol',
  'empresa',
  'sucursal',
  'area',
  'estado',
] as const;

export type BulkUserColumn = (typeof BULK_USER_COLUMNS)[number];

// Columnas que pueden faltar en el archivo (p. ej. plantillas descargadas antes de que existieran)
export const BULK_USER_OPTIONAL_COLUMNS: BulkUserColumn[] = [
  'empresa',
  'estado',
];

// Valores válidos de la columna "estado"
export enum BulkUserEstado {
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO',
}

// Estado que se asume cuando la columna "estado" viene vacía
export const BULK_USER_ESTADO_POR_DEFECTO = BulkUserEstado.ACTIVO;

export type BulkUserFileFormat = 'xlsx' | 'csv';

// Fila leída del archivo; `fila` es el número de fila en la hoja original (la 1 es el encabezado)
export type BulkUserRow = Record<BulkUserColumn, string> & { fila: number };

// Máximo de filas por carga masiva (validación y procesamiento)
export const MAX_BULK_ROWS = 1000;
