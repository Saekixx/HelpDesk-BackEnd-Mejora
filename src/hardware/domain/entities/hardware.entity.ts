import { EstadoHardware } from '../enums/estado-hardware.enum';

// Referencia resumida a una entidad relacionada (cliente, sucursal, área).
export interface HardwareRelacion {
  id: number;
  nombre: string;
}

// Equipo al que está asignado actualmente el hardware y su ubicación.
export interface HardwareEquipoActual {
  id_equipo: number;
  nombre_equipo?: string;
  cliente: HardwareRelacion | null;
  sucursal: HardwareRelacion | null;
  area: HardwareRelacion | null;
}

export interface HardwareProps {
  id_hardware?: number;
  tipo_equipo: string;
  numero_serie: string;
  fecha_compra: Date;
  marca: string;
  proveedor: string;
  url_factura?: string;
  descripcion?: string;
  ult_revision?: Date;
  rev_programada?: Date;
  estado?: EstadoHardware;
  // undefined = la relación no fue cargada; null = sin equipo asignado.
  equipo_actual?: HardwareEquipoActual | null;
  created_at?: Date;
  updated_at?: Date;
}

export class Hardware {
  public readonly id_hardware?: number;
  public readonly tipo_equipo: string;
  public readonly numero_serie: string;
  public readonly fecha_compra: Date;
  public readonly marca: string;
  public readonly proveedor: string;
  public readonly url_factura?: string;
  public readonly descripcion?: string;
  public readonly ult_revision?: Date;
  public readonly rev_programada?: Date;
  public readonly estado: EstadoHardware;
  public readonly equipo_actual?: HardwareEquipoActual | null;
  public readonly created_at: Date;
  public readonly updated_at: Date;

  constructor(props: HardwareProps) {
    this.id_hardware = props.id_hardware;
    this.tipo_equipo = props.tipo_equipo;
    this.numero_serie = props.numero_serie;
    this.fecha_compra = props.fecha_compra;
    this.marca = props.marca;
    this.proveedor = props.proveedor;
    this.url_factura = props.url_factura;
    this.descripcion = props.descripcion;
    this.ult_revision = props.ult_revision;
    this.rev_programada = props.rev_programada;
    // Un hardware recién registrado queda disponible hasta que se instale.
    this.estado = props.estado ?? EstadoHardware.DISPONIBLE;
    this.equipo_actual = props.equipo_actual;
    this.created_at = props.created_at ?? new Date();
    this.updated_at = props.updated_at ?? new Date();
  }

  /** true cuando el componente está instalado en un equipo. */
  get is_active(): boolean {
    return this.estado === EstadoHardware.INSTALADO;
  }
}
