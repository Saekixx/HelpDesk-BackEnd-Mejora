export interface EquipoProps {
  id_equipo?: number;
  tipo: string;
  marca: string;
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

// Software instalado, combinando el catálogo `software` con la asignación
// `software_equipos`.
export interface SoftwareInstalado {
  id_software_equipos: number;
  id_software: number;
  nombre: string;
  // Corresponde a la columna `fecha_caducidad` del catálogo de software.
  vencimiento: Date;
  licencia_asignada: string | null;
  fecha_instalacion: Date | null;
  observaciones: string | null;
  is_active: boolean;
}


export interface EquipoDetail extends EquipoListItem {
  // Valor derivado de id_equipo (ej. "EQ-1042"); no existe en la BD.
  codigo: string;
  hardware: {
    componentes_actuales: ComponenteHardware[];
    historial: ComponenteHardware[];
  };
  software: SoftwareInstalado[];
}