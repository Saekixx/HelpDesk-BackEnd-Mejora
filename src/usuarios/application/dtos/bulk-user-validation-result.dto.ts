export enum BulkUserStatus {
  VALIDO = 'VALIDO',
  ERROR = 'ERROR',
}

export interface BulkUserRowResultDto {
  fila: number;
  estado: BulkUserStatus;
  observacion: string;
  nombre: string;
  correo: string;
  rol: string;
  sucursal: string;
}

export interface BulkUserValidationResultDto {
  total: number;
  validos: number;
  errores: number;
  filas: BulkUserRowResultDto[];
}
