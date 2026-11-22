import { EstadoHardware } from '../enums/estado-hardware.enum';
import { TipoComponente } from '../enums/tipo-componente.enum';
import {
  EquipoDestinoRequeridoException,
  HardwareSinCambioDeEstadoException,
  TransicionHardwareInvalidaException,
} from '../exceptions/hardware.exceptions';
import { TRANSICIONES_HARDWARE } from '../rules/transiciones-hardware';

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

// Movimiento de la hoja de vida del componente (tabla registro_hardware):
// cada vez que se instala o retira de un equipo.
export interface HardwareMovimiento {
  id_RH: number;
  fecha_instalacion: Date;
  fecha_retiro: Date | null;
  motivo_retiro: string | null;
  // true en el movimiento vigente (el componente sigue instalado en ese equipo).
  is_actual: boolean;
  equipo: { id_equipo: number; nombre_equipo: string | null };
  tecnico_responsable: {
    id_usuario: number;
    nombre: string;
    apellido: string;
  } | null;
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
  // undefined = el historial no fue cargado.
  historial?: HardwareMovimiento[];
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
  public readonly historial?: HardwareMovimiento[];
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
    this.historial = props.historial;
    this.created_at = props.created_at ?? new Date();
    this.updated_at = props.updated_at ?? new Date();
  }

  /** true cuando el componente está instalado en un equipo. */
  get is_active(): boolean {
    return this.estado === EstadoHardware.INSTALADO;
  }

  /**
   * Aplica una transición de estado y devuelve el hardware resultante; la
   * entidad actual no se modifica. Solo un hardware INSTALADO tiene equipo
   * asignado: con cualquier otro estado `id_equipo_actual` queda en null.
   * Lanza una excepción de dominio si la transición no es válida.
   */
  transicionarA(destino: EstadoHardware, id_equipo?: number): Hardware {
    const instalar = destino === EstadoHardware.INSTALADO;
    if (instalar && id_equipo === undefined) {
      throw new EquipoDestinoRequeridoException();
    }
    const equipoDestino = instalar ? (id_equipo as number) : null;

    if (destino === this.estado && equipoDestino === this.id_equipo_actual) {
      throw new HardwareSinCambioDeEstadoException(destino, equipoDestino);
    }
    if (!TRANSICIONES_HARDWARE[this.estado].includes(destino)) {
      throw new TransicionHardwareInvalidaException(this.estado, destino);
    }

    // La ubicación cargada (`equipo_actual`) y el historial quedan obsoletos.
    return new Hardware({
      id_hardware: this.id_hardware,
      tipo_componente: this.tipo_componente,
      numero_serie: this.numero_serie,
      marca_modelo: this.marca_modelo,
      proveedor: this.proveedor,
      fecha_compra: this.fecha_compra,
      costo_unitario: this.costo_unitario,
      url_factura: this.url_factura,
      estado: destino,
      id_equipo_actual: equipoDestino,
      created_at: this.created_at,
      updated_at: new Date(),
    });
  }
}
