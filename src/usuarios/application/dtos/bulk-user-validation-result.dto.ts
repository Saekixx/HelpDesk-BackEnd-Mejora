export enum BulkUserStatus {
  VALIDO = 'VALIDO',
  ERROR = 'ERROR',
}

// Detalle de la validación de una fila del archivo
export interface BulkUserRowResultDto {
  fila: number; // Número de fila en la hoja original (la 1 es el encabezado)
  estado: BulkUserStatus;
  observacion: string;
  nombreCompleto: string;
  correo: string;
  rol: string;
  sucursal: string;
}

export interface BulkUserValidationResultDto {
  totalRegistros: number;
  validos: number;
  conError: number;
  detalles: BulkUserRowResultDto[];
}
