export enum BulkUserProcessStatus {
  CREADO = 'CREADO',
  ERROR = 'ERROR',
}

// Detalle del procesamiento de un usuario del lote
export interface BulkUserProcessRowDto {
  fila: number;
  estado: BulkUserProcessStatus;
  observacion: string;
  nombreCompleto: string;
  correo: string;
  rol: string;
  sucursal: string;
  // null si no se intentó enviar (flag desactivado o usuario no creado)
  credencialesEnviadas: boolean | null;
}

export interface BulkUserProcessResultDto {
  totalRecibidos: number;
  creados: number;
  conError: number;
  enviarCredenciales: boolean;
  credencialesEnviadas: number;
  credencialesFallidas: number;
  detalles: BulkUserProcessRowDto[];
}
