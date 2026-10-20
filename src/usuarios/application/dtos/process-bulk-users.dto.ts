import { BulkUserRow } from '@/usuarios/domain/criteria/bulk-user-row.criteria';

export type BulkUserItemDto = Omit<BulkUserRow, 'fila'>;

export interface ProcessBulkUsersDto {
  usuarios: BulkUserItemDto[];
}
