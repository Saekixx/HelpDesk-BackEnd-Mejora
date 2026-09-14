import { Sucursal, SucursalListItem } from '../entities/sucursal.entity';
import { OptionDto } from '../dto/user-options.dto';
import { GetSucursalesFilterDto } from '../dto/get-sucursales-filter.dto';
import { CreateSucursalDto } from '../dto/create-sucursal.dto';
import { UpdateSucursalDto } from '../dto/update-sucursal.dto';

export const SUCURSAL_REPOSITORY = 'SUCURSAL_REPOSITORY';

// Resultado paginado para el listado de sucursales
export interface PaginatedSucursalesResult {
  data: SucursalListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SucursalRepositoryPort {
  // Listado con búsqueda, filtro por cliente/estado y paginación
  findAll(
    filters: GetSucursalesFilterDto,
  ): Promise<PaginatedSucursalesResult>;

  findById(id: number): Promise<Sucursal | null>;

  create(data: CreateSucursalDto): Promise<Sucursal>;

  update(id: number, data: UpdateSucursalDto): Promise<Sucursal>;

  // Activa/desactiva una sucursal (soft toggle sobre is_active)
  toggleStatus(id: number): Promise<Sucursal>;

  getSucursalesOptions(clienteId: number): Promise<OptionDto[]>;
}