import {
  Cliente,
  ClienteListItem,
  ClienteDetail,
  ClienteDetailView,
  CreateClienteCommand,
  CreateClienteResult,
  UpdateClienteCommand,
  UpdateClienteResult,
} from '../entities/cliente.entity';
import { OptionDto } from '../dto/user-options.dto';
import { GetClientesFilterDto } from '../dto/get-clientes-filter.dto';
import { ClienteStatsResult } from '../dto/cliente-stats.dto';

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
  // Registro de un cliente en 3 pasos (POST /clientes). De forma atómica crea
  // el cliente, su usuario responsable (rol CLIENTE_EMPRESA) y su sucursal
  // matriz. Lanza ConflictException si ya existe un cliente con el mismo
  // número de documento o un usuario con el mismo correo.
  create(command: CreateClienteCommand): Promise<CreateClienteResult>;

  // Actualización parcial de un cliente (PATCH /clientes/:id): razón social,
  // número de documento, rubro y plan de soporte. Solo modifica los campos
  // presentes en el comando. Lanza NotFoundException si el cliente no existe,
  // ConflictException si el número de documento ya pertenece a otro cliente y
  // BadRequestException si el plan indicado no existe.
  update(
    id: number,
    command: UpdateClienteCommand,
  ): Promise<UpdateClienteResult>;
  toggleStatus(id: number): Promise<Cliente>;
  getClientesOptions(): Promise<OptionDto[]>;
  existsByDocumento(numero_documento: string): Promise<boolean>;
  // Estadísticas (KPIs) del módulo de clientes: totales por tipo, nuevos del
  // mes actual y clientes activos con plan Enterprise.
  getStats(): Promise<ClienteStatsResult>;
}
