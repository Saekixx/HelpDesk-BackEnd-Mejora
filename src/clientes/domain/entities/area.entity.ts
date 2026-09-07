export interface AreaProps {
  id_area?: number;
  nombre_area: string;
  contacto: string;
  telefono: string;
  correo: string;
  is_active: boolean;
  id_sucursal: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Area {
  public readonly id_area?: number;
  public readonly nombre_area: string;
  public readonly contacto: string;
  public readonly telefono: string;
  public readonly correo: string;
  public readonly is_active: boolean;
  public readonly id_sucursal: number;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: AreaProps) {
    this.id_area = props.id_area;
    this.nombre_area = props.nombre_area;
    this.contacto = props.contacto;
    this.telefono = props.telefono;
    this.correo = props.correo;
    this.is_active = props.is_active;
    this.id_sucursal = props.id_sucursal;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }
}
