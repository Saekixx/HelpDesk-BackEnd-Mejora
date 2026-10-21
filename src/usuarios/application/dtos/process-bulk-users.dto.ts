import { BulkUserRow } from '@/usuarios/domain/criteria/bulk-user-row.criteria';

// Usuario aprobado en la pre-validación; `fila` es opcional para poder reportar la fila original del archivo
export type BulkUserItemDto = Omit<BulkUserRow, 'fila' | 'sucursal' | 'area'> &
  Partial<Pick<BulkUserRow, 'fila' | 'sucursal' | 'area'>>;

export interface ProcessBulkUsersDto {
  idCliente: number;
  enviarCredenciales: boolean;
  usuarios: BulkUserItemDto[];
}
