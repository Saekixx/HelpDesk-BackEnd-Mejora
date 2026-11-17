import { TipoComponente } from '@/hardware/domain/enums/tipo-componente.enum';
import { EstadoEquipo } from '../enums/estado-equipo.enum';

export interface EquipoProps {
  id_equipo?: number;
  tipo: string;
  marca: string;
  nombre_equipo?: string;
  num_serie?: string;
  nombre_usuario?: string;
  ult_revision?: Date;
  rev_programada?: Date;
  id_trabajador?: number;
  id_cliente?: number;
  id_sucursal?: number;
  id_area?: number;
  is_active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Equipo {
  public readonly id_equipo?: number;
  public readonly tipo: string;
  public readonly marca: string;
  public readonly nombre_equipo?: string;
  public readonly num_serie?: string;
  public readonly nombre_usuario?: string;
  public readonly ult_revision?: Date;
  public readonly rev_programada?: Date;
  public readonly id_trabajador?: number;
  public readonly id_cliente?: number;
  public readonly id_sucursal?: number;
  public readonly id_area?: number;
  public readonly is_active: boolean;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: EquipoProps) {
    this.id_equipo = props.id_equipo;
    this.tipo = props.tipo;
    this.marca = props.marca;
    this.nombre_equipo = props.nombre_equipo;
    this.num_serie = props.num_serie;
    this.nombre_usuario = props.nombre_usuario;
    this.ult_revision = props.ult_revision;
    this.rev_programada = props.rev_programada;
    this.id_trabajador = props.id_trabajador;
    this.id_cliente = props.id_cliente;
    this.id_sucursal = props.id_sucursal;
    this.id_area = props.id_area;
    this.is_active = props.is_active;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }
}

// Referencias resumidas de las entidades relacionadas, para uso en listados
// (findAll) sin tener que cargar el objeto completo.
export interface RelacionSummary {
  id: number;
  nombre: string;
}

// Item del listado paginado (GET /equipos): las relaciones llegan con sus
// campos completos para que el frontend no tenga que consultarlas aparte.
export interface EquipoListadoItem extends Equipo {
  // Estado operativo del equipo (ej. "Activo", "En_Almacen").
  estado: EstadoEquipo;
  cliente: { id_cliente: number; nombre_principal: string } | null;
  sucursal: { id_sucursal: number; nombre_sucursal: string } | null;
  area: { id_area: number; nombre_area: string } | null;
  // null si el equipo no está asignado a ningún trabajador.
  trabajador: {
    id_usuario: number;
    nombre: string;
    apellido: string;
    correo: string | null;
  } | null;
}

// Respuesta de POST /equipos: el equipo recién registrado con su ubicación y
// trabajador asignado, sin campos internos (is_active) ni IDs sueltos.
export interface EquipoCreadoItem {
  id_equipo: number;
  nombre_equipo: string | null;
  tipo: string;
  marca_modelo: string | null;
  num_serie: string | null;
  estado: EstadoEquipo;
  ult_revision: Date | null;
  rev_programada: Date | null;
  cliente: EquipoListadoItem['cliente'];
  sucursal: EquipoListadoItem['sucursal'];
  area: EquipoListadoItem['area'];
  // null si el equipo se registró sin trabajador (estado En_Almacen).
  trabajador: EquipoListadoItem['trabajador'];
  created_at: Date | null;
}

export interface EquipoListItem extends Equipo {
  cliente: RelacionSummary | null;
  sucursal: RelacionSummary | null;
  area: RelacionSummary | null;
  trabajador: RelacionSummary | null;
}

export interface ComponenteHardware {
  id_RH: number;
  tipo: string | null;
  marca: string | null;
  descripcion: string;
  serie: string;
  proveedor: string;
  fecha_instalacion: Date;
  url_factura?: string | null;

  is_active: boolean;
}

// ---- Detalle del equipo (GET /equipos/:id): "Hoja de Vida del Equipo" ----

export interface EquipoDetailCliente {
  id_cliente: number;
  nombre_principal: string;
}

export interface EquipoDetailSucursal {
  id_sucursal: number;
  nombre_sucursal: string;
  direccion: string;
  encargado: string;
}

export interface EquipoDetailArea {
  id_area: number;
  nombre_area: string;
}

export interface EquipoDetailTrabajador {
  id_usuario: number;
  nombre: string;
  apellido: string;
  correo: string | null;
  telefono: string | null;
}

// Técnico que instaló o retiró el componente.
export interface TecnicoResponsable {
  id_usuario: number;
  nombre: string;
  apellido: string;
}

// Componente instalado actualmente en el equipo.
export interface ComponenteActual {
  id_RH: number;
  id_hardware: number;
  tipo_componente: TipoComponente;
  marca_modelo: string;
  numero_serie: string;
  proveedor: string | null;
  url_factura: string | null;
  salud_smart: string | null;
  motivo_instalacion: string | null;
  fecha_instalacion: Date;
  tecnico_responsable: TecnicoResponsable | null;
  is_active: boolean;
}

// Componente retirado del equipo (historial).
export interface ComponenteRetirado {
  id_RH: number;
  id_hardware: number;
  tipo_componente: TipoComponente;
  marca_modelo: string;
  numero_serie: string;
  proveedor: string | null;
  fecha_instalacion: Date;
  fecha_retiro: Date | null;
  motivo_retiro: string | null;
  tecnico_responsable: TecnicoResponsable | null;
  is_active: boolean;
}

// Licencia asignada al equipo: catálogo `software` + asignación
// `software_equipos`.
export interface SoftwareAsignado {
  id_software_equipos: number;
  id_software: number;
  nombre_software: string;
  categoria: string | null;
  // Clave del enum `tipo_licencia_enum` (ej. "Pool_Limitado").
  tipo_licencia: string;
  licencia_asignada: string | null;
  correo_asociado: string | null;
  // Contraseña cifrada; nunca en texto plano.
  password_enc: string | null;
  fecha_instalacion: Date | null;
  // Vencimiento de la asignación o, si no tiene, el del catálogo.
  vencimiento: Date | null;
  observaciones: string | null;
  is_active: boolean;
}

export interface EquipoDetail {
  id_equipo: number;
  nombre_equipo: string | null;
  tipo: string;
  marca_modelo: string | null;
  estado: EstadoEquipo;
  num_serie: string | null;
  ult_revision: Date | null;
  rev_programada: Date | null;
  is_active: boolean;
  created_at: Date | null;
  updated_at: Date | null;
  cliente: EquipoDetailCliente | null;
  sucursal: EquipoDetailSucursal | null;
  area: EquipoDetailArea | null;
  // null si el equipo no está asignado a ningún trabajador.
  trabajador: EquipoDetailTrabajador | null;
  hardware: {
    componentes_actuales: ComponenteActual[];
    historial: ComponenteRetirado[];
  };
  software: SoftwareAsignado[];
}

// Item ligero de GET /equipos/options: lo mínimo para identificar un equipo en
// selectores y desplegables.
export interface EquipoOptionItem {
  id_equipo: number;
  nombre_equipo: string | null;
  num_serie: string | null;
  tipo: string;
  marca_modelo: string | null;
  estado: EstadoEquipo;
}

// KPI del inventario de equipos (GET /equipos/estadisticas). Solo cuenta equipos
// activos; `asignados` + `sin_asignar` = `total_equipos`.
export interface EquipoEstadisticas {
  total_equipos: number; // Equipos activos registrados.
  asignados: number; // Activos con un trabajador asignado.
  sin_asignar: number; // Activos sin trabajador asignado.
}
