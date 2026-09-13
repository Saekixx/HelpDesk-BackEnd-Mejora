import { Cliente } from '../entities/cliente.entity';
import { OptionDto } from '../dto/user-options.dto';
import { GetClientesFilterDto } from '../dto/get-clientes-filter.dto';

export const CLIENTE_REPOSITORY = 'CLIENTE_REPOSITORY';

// Resultado paginado para el listado de clientes
export interface PaginatedClientesResult {
  data: Cliente[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ClienteRepositoryPort {
  findAll(filter: GetClientesFilterDto): Promise<PaginatedClientesResult>;
  findById(id: number): Promise<Cliente | null>;
  create(cliente: Cliente): Promise<Cliente>;
  update(id: number, cliente: Cliente): Promise<Cliente>;
  toggleStatus(id: number): Promise<Cliente>;
  getClientesOptions(): Promise<OptionDto[]>;
  existsByDocumento(numero_documento: string): Promise<boolean>;
}