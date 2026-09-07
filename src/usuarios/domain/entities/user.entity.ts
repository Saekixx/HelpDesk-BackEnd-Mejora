export interface UserProps {
  id_usuario?: number;
  nombre: string;
  apellido: string;
  correo: string;
  password: string;
  telefono: string;
  is_active: boolean;
  id_rol: number;
  id_cliente?: number | null;
  id_sucursal?: number | null;
  id_area?: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User {
  public readonly id_usuario?: number;
  public readonly nombre: string;
  public readonly apellido: string;
  public readonly correo: string;
  public readonly password: string;
  public readonly telefono: string;
  public readonly is_active: boolean;
  public readonly id_rol: number;
  public readonly id_cliente: number | null;
  public readonly id_sucursal: number | null;
  public readonly id_area: number | null;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: UserProps) {
    this.id_usuario = props.id_usuario;
    this.nombre = props.nombre;
    this.apellido = props.apellido;
    this.correo = props.correo;
    this.password = props.password;
    this.telefono = props.telefono;
    this.is_active = props.is_active;
    this.id_rol = props.id_rol;
    this.id_cliente = props.id_cliente ?? null;
    this.id_sucursal = props.id_sucursal ?? null;
    this.id_area = props.id_area ?? null;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }
}
