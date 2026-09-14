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

export interface ClienteListItem extends Cliente {
  // Cantidad total de sucursales del cliente (Prisma: _count.sucursales)
  total_sucursales: number;
  plan: { id_plan: number; nombre: string } | null;
}


// Resumen del plan contratado por el cliente (Prisma: relación `planes`)
export interface PlanSummary {
  id_plan: number;
  nombre: string;
  tipo: string;
  precio?: number;
  limite_equipos?: number;
  is_active?: boolean;
}

// Resumen de cada sucursal asociada al cliente (Prisma: relación `sucursales`)
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