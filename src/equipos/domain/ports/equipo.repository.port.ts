import {
  ComponenteHardware,
  Equipo,
  EquipoDetail,
  EquipoListItem,
} from '../entities/equipo.entity';
import { GetEquiposFilterDto } from '../dto/get-equipos-filter.dto';
import { CreateEquipoDto } from '../dto/create-equipo.dto';
import { UpdateEquipoDto } from '../dto/update-equipo.dto';
import { AgregarComponenteDto } from '../dto/agregar-componente.dto';
import { ReemplazarComponenteDto } from '../dto/reemplazar-componente.dto';

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

  // create y update devuelven el equipo con sus relaciones resumidas (cliente,
  // sucursal, área y trabajador asignado), igual que el listado.
  create(data: CreateEquipoDto): Promise<EquipoListItem>;

  update(id: number, data: UpdateEquipoDto): Promise<EquipoListItem>;

  // Activa/desactiva un equipo (soft toggle sobre is_active)
  toggleStatus(id: number): Promise<Equipo>;

  existsByNumSerie(num_serie: string): Promise<boolean>;

  // Verifica si un equipo pertenece a un usuario
  isEquipoOwnedByUsuario(idEquipo: number, idUsuario: number): Promise<boolean>;

  // Asocia un componente de hardware existente a un equipo, registrándolo como
  // componente actual en registro_hardware. Lanza EquipoNotFoundException o
  // ComponenteHardwareNotFoundException si el equipo o el hardware no existen.
  agregarComponente(
    id_equipo: number,
    dto: AgregarComponenteDto,
  ): Promise<ComponenteHardware>;

  // Reemplaza de forma transaccional un componente actual del equipo: marca el
  // registro saliente como histórico (is_actual = false) y crea el nuevo como
  // actual. Lanza EquipoNotFoundException, ComponenteHardwareNotFoundException
  // (hardware nuevo) o ComponenteNoInstaladoException (saliente no instalado).
  reemplazarComponente(
    id_equipo: number,
    dto: ReemplazarComponenteDto,
  ): Promise<ComponenteHardware>;
}