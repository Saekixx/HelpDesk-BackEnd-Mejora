import {
  ComponenteHardware,
  Equipo,
  EquipoCreadoItem,
  EquipoDetail,
  EquipoEstadisticas,
  EquipoListadoItem,
  EquipoOptionItem,
} from '../entities/equipo.entity';
import { GetEquiposFilterDto } from '../dto/get-equipos-filter.dto';
import { GetEquipoOptionsFilterDto } from '../dto/get-equipo-options-filter.dto';
import { CreateEquipoData } from '../dto/create-equipo-data.dto';
import { AgregarComponenteDto } from '../dto/agregar-componente.dto';
import { ReemplazarComponenteDto } from '../dto/reemplazar-componente.dto';

export const EQUIPO_REPOSITORY = 'EQUIPO_REPOSITORY';

// Resultado paginado para el listado de equipos
export interface PaginatedEquiposResult {
  data: EquipoListadoItem[];
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

  // Opciones ligeras para selectores (GET /equipos/options): solo equipos
  // activos, con filtros opcionales por cliente, sucursal, área, estado y
  // búsqueda parcial, ordenados por nombre.
  getEquipoOptions(
    filters?: GetEquipoOptionsFilterDto,
  ): Promise<EquipoOptionItem[]>;

  // Conteos de equipos activos para las tarjetas KPI del inventario
  // (GET /equipos/estadisticas): total, asignados y sin asignar. No recibe
  // filtros.
  getEstadisticas(): Promise<EquipoEstadisticas>;

  // Devuelve el equipo registrado con su ubicación y trabajador.
  create(data: CreateEquipoData): Promise<EquipoCreadoItem>;

  // Activa/desactiva un equipo (soft toggle sobre is_active)
  toggleStatus(id: number): Promise<Equipo>;

  // Libera el equipo: desvincula al trabajador custodio (id_trabajador = null)
  // y lo deja "En_Almacen". Lanza EquipoNotFoundException si el equipo no
  // existe. Solo persiste el cambio: las reglas de negocio (p. ej. qué estados
  // admiten liberar) se validan en el caso de uso.
  release(id: number): Promise<void>;

  // Asigna el equipo a un trabajador (id_trabajador) y lo deja "Activo".
  // `observaciones` solo se guarda si viene informada; si se omite, las
  // observaciones actuales del equipo no se tocan. Lanza
  // EquipoNotFoundException si el equipo no existe y
  // TrabajadorEquipoNoDisponibleException si el trabajador no existe. Las
  // demás reglas (trabajador activo y del mismo cliente, equipo activo) se
  // validan en el caso de uso.
  assign(
    id: number,
    idTrabajador: number,
    observaciones?: string,
  ): Promise<void>;

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
