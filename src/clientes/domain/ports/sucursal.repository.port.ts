import { Sucursal } from '../entities/sucursal.entity';
import { OptionDto } from '../dto/user-options.dto';

export const SUCURSAL_REPOSITORY = 'SUCURSAL_REPOSITORY';

export interface SucursalRepositoryPort {
  save(sucursal: Sucursal): Promise<Sucursal>;

  findById(id: number): Promise<Sucursal | null>;

  getSucursalesOptions(clienteId: number): Promise<OptionDto[]>;
}
