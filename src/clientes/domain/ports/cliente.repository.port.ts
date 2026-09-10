import { Cliente } from '../entities/cliente.entity';
import { OptionDto } from '../dto/user-options.dto';

export const CLIENTE_REPOSITORY = 'CLIENTE_REPOSITORY';

export interface ClienteRepositoryPort {
  save(cliente: Cliente): Promise<Cliente>;

  findById(id: number): Promise<Cliente | null>;

  getClientesOptions(): Promise<OptionDto[]>;
}
