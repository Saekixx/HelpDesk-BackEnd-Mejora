import {
  Cliente,
  ClienteListItem,
  ClienteDetail,
  ClienteDetailView,
} from '../entities/cliente.entity';
import { OptionDto } from '../dto/user-options.dto';
import { GetClientesFilterDto } from '../dto/get-clientes-filter.dto';
import { ClienteStatsResult } from '../dto/cliente-stats.dto';
import {
  SucursalAnidadaPersistData,
  UpdateSucursalAnidadaPersistData,
} from '../dto/sucursal-anidada.dto';

export const CLIENTE_REPOSITORY = 'CLIENTE_REPOSITORY';

// Metadatos de paginación del listado de clientes
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Resultado paginado para el listado de clientes: { data, meta }
export interface PaginatedClientesResult {
  data: ClienteListItem[];
  meta: PaginationMeta;
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
  // Listado paginado de clientes (GET /clientes). Aplica los filtros
  // opcionales (search, tipo_cliente, is_active) y la paginación
  // (page, limit) del criterio recibido, y retorna cada cliente con la
  // estructura de `ClienteListItem` junto con `meta` de paginación.
  findAll(filter: GetClientesFilterDto): Promise<PaginatedClientesResult>;
  findById(id: number): Promise<ClienteDetail | null>;
  // Detalle de un cliente específico (GET /clientes/:id):
  // plan, contacto de enlace y solo las sucursales activas (la principal
  // primero) con su total de equipos. Retorna null si el cliente no existe.
  findDetailById(id: number): Promise<ClienteDetailView | null>;
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
  // Estadísticas (KPIs) del módulo de clientes: totales por tipo, nuevos del
  // mes actual y clientes activos con plan Enterprise.
  getStats(): Promise<ClienteStatsResult>;
}