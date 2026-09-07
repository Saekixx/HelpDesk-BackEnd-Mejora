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
