import { BulkUserRow } from '@/usuarios/domain/criteria/bulk-user-row.criteria';

// Usuario aprobado en la pre-validación; `fila` es opcional para poder reportar la fila original del archivo
type BulkUserOptionalKeys = 'fila' | 'empresa' | 'sucursal' | 'area' | 'estado';
export type BulkUserItemDto = Omit<BulkUserRow, BulkUserOptionalKeys> &
  Partial<Pick<BulkUserRow, BulkUserOptionalKeys>>;

export interface ProcessBulkUsersDto {
  idCliente: number;
  enviarCredenciales: boolean;
  usuarios: BulkUserItemDto[];
}
