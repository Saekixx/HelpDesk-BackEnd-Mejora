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
import { RegistrarInstalarComponenteData } from '../dto/registrar-instalar-componente-data.dto';

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

  // Alterna el estado lógico del equipo (PATCH /equipos/:id/estado) y deja
  // coherentes is_active, estado e id_trabajador en una sola escritura:
  // - Si está activo lo desactiva: is_active = false, estado = "Retirado" e
  //   id_trabajador = null (un equipo retirado no puede seguir en custodia).
  // - Si está desactivado lo reactiva: is_active = true, estado = "En_Almacen"
  //   e id_trabajador = null, disponible para una nueva asignación.
  // Devuelve el equipo ya actualizado y lanza EquipoNotFoundException si el
  // equipo no existe.
  toggleEstado(id: number): Promise<Equipo>;

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

  // Monta en el equipo un componente que está en stock
  // (POST /equipos/:id/componentes/montar-stock). En una sola transacción pasa
  // el hardware de "Disponible" a "Instalado" (id_equipo_actual = idEquipo) y
  // crea su movimiento actual en registro_hardware (fecha de instalación,
  // observaciones como motivo y, si se informa, el técnico responsable). La
  // reserva del componente es atómica: si otra operación lo toma primero, se
  // lanza ComponenteNoDisponibleException y no se escribe nada.
  // Lanza:
  // - EquipoNotFoundException: el equipo no existe.
  // - ComponenteHardwareNotFoundException: el componente no existe.
  // - ComponenteNoDisponibleException: el componente no está "Disponible" o ya
  //   tiene un equipo asignado.
  // - TecnicoResponsableNoDisponibleException: el técnico informado no existe.
  // Solo persiste: reglas como que el equipo esté activo se validan en el
  // caso de uso.
  montarComponenteStock(
    idEquipo: number,
    idHardware: number,
    fechaInstalacion: Date,
    observaciones?: string,
    idTecnico?: number,
  ): Promise<void>;

  // Registra un componente nuevo y lo deja instalado en el equipo
  // (POST /equipos/:id/componentes/registrar-instalar). En una sola
  // transacción crea el hardware (estado "Instalado", id_equipo_actual =
  // idEquipo) y su movimiento actual en registro_hardware; si algo falla no
  // queda ni el componente ni el movimiento.
  // Lanza:
  // - EquipoNotFoundException: el equipo no existe.
  // - NumeroSerieComponenteDuplicadoException: ya existe un componente con ese
  //   número de serie.
  // - TecnicoResponsableNoDisponibleException: el técnico informado no existe.
  // Solo persiste: reglas como que el equipo esté activo se validan en el
  // caso de uso.
  registrarEInstalarComponente(
    idEquipo: number,
    data: RegistrarInstalarComponenteData,
  ): Promise<void>;
}
