import {
  Equipo,
  EquipoDetail,
  EquipoListItem,
} from '../entities/equipo.entity';
import { GetEquiposFilterDto } from '../dto/get-equipos-filter.dto';
import { CreateEquipoDto } from '../dto/create-equipo.dto';
import { UpdateEquipoDto } from '../dto/update-equipo.dto';

export const EQUIPO_REPOSITORY = 'EQUIPO_REPOSITORY';

// Resultado paginado para el listado de equipos
export interface PaginatedEquiposResult {
  data: EquipoListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface EquipoRepositoryPort {
  // Listado con búsqueda, filtro por cliente/sucursal/estado y paginación
  findAll(filters: GetEquiposFilterDto): Promise<PaginatedEquiposResult>;

  findById(id: number): Promise<Equipo | null>;

  // Usado exclusivamente por GET /equipos/:id. Incluye cliente, sucursal, área,
  // trabajador, los componentes de registro_hardware y el software
  // instalado.
  findDetailById(id: number): Promise<EquipoDetail | null>;

  create(data: CreateEquipoDto): Promise<Equipo>;

  update(id: number, data: UpdateEquipoDto): Promise<Equipo>;

  // Activa/desactiva un equipo (soft toggle sobre is_active)
  toggleStatus(id: number): Promise<Equipo>;

  existsByNumSerie(num_serie: string): Promise<boolean>;

  // Verifica si un equipo pertenece a un usuario
  isEquipoOwnedByUsuario(idEquipo: number, idUsuario: number): Promise<boolean>;
}
