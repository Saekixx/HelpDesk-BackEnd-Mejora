export interface SucursalProps {
  id_sucursal?: number;
  nombre_sucursal: string;
  encargado: string;
  telefono: string;
  direccion: string;
  correo: string;
  is_active: boolean;
  id_cliente: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Sucursal {
  public readonly id_sucursal?: number;
  public readonly nombre_sucursal: string;
  public readonly encargado: string;
  public readonly telefono: string;
  public readonly direccion: string;
  public readonly correo: string;
  public readonly is_active: boolean;
  public readonly id_cliente: number;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: SucursalProps) {
    this.id_sucursal = props.id_sucursal;
    this.nombre_sucursal = props.nombre_sucursal;
    this.encargado = props.encargado;
    this.telefono = props.telefono;
    this.direccion = props.direccion;
    this.correo = props.correo;
    this.is_active = props.is_active;
    this.id_cliente = props.id_cliente;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }
}
