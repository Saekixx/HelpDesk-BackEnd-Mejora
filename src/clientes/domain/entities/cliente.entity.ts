export enum TipoCliente {
  JURIDICA = 'JURIDICA',
  NATURAL = 'NATURAL',
}

export interface ClienteProps {
  id_cliente?: number;
  tipo_cliente: TipoCliente;
  numero_documento: string;
  nombre_principal: string;
  direccion: string;
  telefono: string;
  correo: string;
  rubro: string;
  fecha_inicio_plan: Date;
  fecha_finalizacion_plan: Date;
  costo_negociado: number;
  limite_equipos_contratado: number;
  is_active: boolean;
  id_plan: number;
  fecha_registro?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Cliente {
  public readonly id_cliente?: number;
  public readonly tipo_cliente: TipoCliente;
  public readonly numero_documento: string;
  public readonly nombre_principal: string;
  public readonly direccion: string;
  public readonly telefono: string;
  public readonly correo: string;
  public readonly rubro: string;
  public readonly fecha_inicio_plan: Date;
  public readonly fecha_finalizacion_plan: Date;
  public readonly costo_negociado: number;
  public readonly limite_equipos_contratado: number;
  public readonly is_active: boolean;
  public readonly id_plan: number;
  public readonly fecha_registro: Date;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: ClienteProps) {
    this.id_cliente = props.id_cliente;
    this.tipo_cliente = props.tipo_cliente;
    this.numero_documento = props.numero_documento;
    this.nombre_principal = props.nombre_principal;
    this.direccion = props.direccion;
    this.telefono = props.telefono;
    this.correo = props.correo;
    this.rubro = props.rubro;
    this.fecha_inicio_plan = props.fecha_inicio_plan;
    this.fecha_finalizacion_plan = props.fecha_finalizacion_plan;
    this.costo_negociado = props.costo_negociado;
    this.limite_equipos_contratado = props.limite_equipos_contratado;
    this.is_active = props.is_active;
    this.id_plan = props.id_plan;
    this.fecha_registro = props.fecha_registro ?? new Date();
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }
}

// Estado legible del cliente
export type EstadoCliente = 'activo' | 'inactivo';

// Vista de lista usada por GET /clientes (Listado Avanzado de Clientes).
export interface ClienteListItem {
  id_cliente: number;
  // Nombre (persona natural) o Razón Social (persona jurídica)
  nombre_principal: string;
  // Rubro o sector económico (ej. "Sector Financiero & Banca")
  rubro: string;
  tipo_cliente: TipoCliente;
  // RUC o DNI
  numero_documento: string;
  // Cantidad de sucursales asociadas
  totalSucursales: number;
  // Nombre del plan de soporte asignado.
  // null si el cliente no tiene un plan asignado.
  planSoporte: string | null;
  estado: EstadoCliente;
}


// Resumen del plan contratado por el cliente
export interface PlanSummary {
  id_plan: number;
  nombre: string;
  tipo: string;
  precio?: number;
  limite_equipos?: number;
  is_active?: boolean;
}

// Resumen de cada sucursal asociada al cliente
export interface SucursalSummary {
  id_sucursal: number;
  nombre: string;
  encargado: string;
  telefono: string;
  correo: string;
  direccion: string;
  is_active: boolean;
}

// Vista enriquecida usada por GET /clientes/:id: incluye el plan contratado
// y el listado de sucursales del cliente.
export interface ClienteDetail extends Cliente {
  plan: PlanSummary | null;
  sucursales: SucursalSummary[];
}

// ---------------------------------------------------------------------------
// Vista de detalle (GET /clientes/:id).
// Es una proyección de solo lectura: no reutiliza
// `ClienteDetail` porque ese tipo extiende la entidad completa y lo consume
// el flujo de actualización.
// ---------------------------------------------------------------------------

// Plan contratado
export interface ClientePlanView {
  id_plan: number;
  tipo: string;
  limite_equipos: number;
}

// Persona de contacto (enlace) de la empresa
export interface ContactoEnlaceView {
  nombre_responsable: string;
  cargo: string;
  correo: string;
  telefono: string;
}

// Sucursal activa del cliente con su cantidad de equipos vinculados
export interface SucursalActivaView {
  id_sucursal: number;
  is_principal: boolean;
  nombre: string;
  direccion: string;
  total_equipos: number;
}

export interface ClienteDetailView {
  id_cliente: number;
  nombre_principal: string;
  numero_documento: string;
  tipo_cliente: TipoCliente;
  rubro: string | null;
  direccion: string | null;
  plan: ClientePlanView | null;
  contacto_enlace: ContactoEnlaceView | null;
  // La sucursal principal (is_principal: true) siempre va primero
  sucursales_activas: SucursalActivaView[];
}
