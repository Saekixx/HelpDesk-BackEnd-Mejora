// src/clientes/domain/ports/area.repository.port.ts
import { Area, AreaListItem } from '../entities/area.entity';
import { OptionDto } from '../dto/user-options.dto';
import { GetAreasFilterDto } from '../dto/get-areas-filter.dto';
import { CreateAreaDto } from '../dto/create-area.dto';
import { UpdateAreaDto } from '../dto/update-area.dto';

export const AREA_REPOSITORY = 'AREA_REPOSITORY';

// Resultado paginado para el listado de áreas
export interface PaginatedAreasResult {
  data: AreaListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AreaRepositoryPort {
  // Listado con búsqueda, filtro por cliente/sucursal/estado y paginación.
  // El filtro por id_cliente se resuelve en el adaptador mediante el join
  // area -> sucursal, ya que Area no posee id_cliente propio.
  findAll(filters: GetAreasFilterDto): Promise<PaginatedAreasResult>;

  findById(id: number): Promise<Area | null>;

  create(data: CreateAreaDto): Promise<Area>;

  update(id: number, data: UpdateAreaDto): Promise<Area>;

  // Activa/desactiva un área (soft toggle sobre is_active)
  toggleStatus(id: number): Promise<Area>;

  getAreasOptions(sucursalId: number): Promise<OptionDto[]>;
}