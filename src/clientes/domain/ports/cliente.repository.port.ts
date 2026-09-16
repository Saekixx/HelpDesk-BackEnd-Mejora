import {
  Cliente,
  ClienteListItem,
  ClienteDetail,
} from '../entities/cliente.entity';
import { OptionDto } from '../dto/user-options.dto';
import { GetClientesFilterDto } from '../dto/get-clientes-filter.dto';
import {
  SucursalAnidadaPersistData,
  UpdateSucursalAnidadaPersistData,
} from '../dto/sucursal-anidada.dto';

export const CLIENTE_REPOSITORY = 'CLIENTE_REPOSITORY';

// Resultado paginado para el listado de clientes
export interface PaginatedClientesResult {
  data: ClienteListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Sucursales a crear junto con el cliente (POST /clientes)
export interface NuevoClienteSucursalesInput {
  principal: SucursalAnidadaPersistData;
  adicionales: SucursalAnidadaPersistData[];
}

// Sucursales a crear/actualizar junto con el cliente (PUT /clientes/:id).
// "principal" es un merge parcial sobre la sucursal principal existente
// (o la crea si el cliente no tenía ninguna marcada); "adicionales" son
// sucursales nuevas que se agregan (no reemplazan a las existentes).
export interface ActualizarClienteSucursalesInput {
  principal?: UpdateSucursalAnidadaPersistData;
  adicionales?: SucursalAnidadaPersistData[];
}

export interface ClienteRepositoryPort {
  findAll(filter: GetClientesFilterDto): Promise<PaginatedClientesResult>;
  findById(id: number): Promise<ClienteDetail | null>;
  create(
    cliente: Cliente,
    sucursales: NuevoClienteSucursalesInput,
  ): Promise<Cliente>;

  update(
    id: number,
    cliente: Cliente,
    sucursales?: ActualizarClienteSucursalesInput,
  ): Promise<ClienteDetail>;
  toggleStatus(id: number): Promise<Cliente>;
  getClientesOptions(): Promise<OptionDto[]>;
  existsByDocumento(numero_documento: string): Promise<boolean>;
}