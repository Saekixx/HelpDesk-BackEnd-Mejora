export interface RolProps {
  id_rol?: number;
  nombre: string;
  createdAt?: Date;
}

export class Rol {
  public readonly id_rol?: number;
  public readonly nombre: string;
  public readonly createdAt: Date;

  constructor(props: RolProps) {
    this.id_rol = props.id_rol;
    this.nombre = props.nombre;
    this.createdAt = props.createdAt ?? new Date();
  }
}
