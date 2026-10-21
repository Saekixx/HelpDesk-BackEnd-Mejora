import {
  BulkUserFileFormat,
  BulkUserRow,
} from '../criteria/bulk-user-row.criteria';

// Token único para la Inyección de Dependencias en NestJS
export const BULK_USER_FILE_PORT = 'BULK_USER_FILE_PORT';

export interface BulkUserFilePort {
  // Genera la plantilla estándar (.xlsx) para la carga masiva de usuarios
  generateTemplate(): Promise<Buffer>;

  // Lee un archivo .xlsx o .csv y devuelve sus filas con datos
  parseRows(file: Buffer, format: BulkUserFileFormat): Promise<BulkUserRow[]>;
}
