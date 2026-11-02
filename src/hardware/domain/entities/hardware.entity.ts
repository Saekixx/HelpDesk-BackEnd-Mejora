import { EstadoHardware } from '../enums/estado-hardware.enum';
import { TipoComponente } from '../enums/tipo-componente.enum';

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
  tipo_componente: TipoComponente;
  numero_serie: string;
  marca_modelo: string;
  proveedor?: string;
  fecha_compra?: Date;
  costo_unitario?: number;
  url_factura?: string;
  estado?: EstadoHardware;
  // ID del equipo donde está instalado; null = sin equipo asignado.
  id_equipo_actual?: number | null;
  // undefined = la relación no fue cargada; null = sin equipo asignado.
  equipo_actual?: HardwareEquipoActual | null;
  created_at?: Date;
  updated_at?: Date;
}

export class Hardware {
  public readonly id_hardware?: number;
  public readonly tipo_componente: TipoComponente;
  public readonly numero_serie: string;
  public readonly marca_modelo: string;
  public readonly proveedor?: string;
  public readonly fecha_compra?: Date;
  public readonly costo_unitario: number;
  public readonly url_factura?: string;
  public readonly estado: EstadoHardware;
  public readonly id_equipo_actual: number | null;
  public readonly equipo_actual?: HardwareEquipoActual | null;
  public readonly created_at: Date;
  public readonly updated_at: Date;

  constructor(props: HardwareProps) {
    this.id_hardware = props.id_hardware;
    this.tipo_componente = props.tipo_componente;
    this.numero_serie = props.numero_serie;
    this.marca_modelo = props.marca_modelo;
    this.proveedor = props.proveedor;
    this.fecha_compra = props.fecha_compra;
    this.costo_unitario = props.costo_unitario ?? 0;
    this.url_factura = props.url_factura;
    // Un hardware recién registrado queda disponible hasta que se instale.
    this.estado = props.estado ?? EstadoHardware.DISPONIBLE;
    this.id_equipo_actual = props.id_equipo_actual ?? null;
    this.equipo_actual = props.equipo_actual;
    this.created_at = props.created_at ?? new Date();
    this.updated_at = props.updated_at ?? new Date();
  }

  /** true cuando el componente está instalado en un equipo. */
  get is_active(): boolean {
    return this.estado === EstadoHardware.INSTALADO;
  }
}
