import { Sucursal } from '../entities/sucursal.entity';

export const SUCURSAL_REPOSITORY = 'SUCURSAL_REPOSITORY';

export interface SucursalRepositoryPort {
  save(sucursal: Sucursal): Promise<Sucursal>;
  findById(id: number): Promise<Sucursal | null>;
}
