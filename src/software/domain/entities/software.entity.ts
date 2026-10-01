export interface SoftwareProps {
  id_software?: number;
  nombre_software: string;
  licencia: string;
  correo: string;
  password?: string;
  fecha_instalacion: Date;
  fecha_caducidad: Date;
  proveedor: string;
  is_active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Software {
  public readonly id_software?: number;
  public readonly nombre_software: string;
  public readonly licencia: string;
  public readonly correo: string;
  public readonly password?: string;
  public readonly fecha_instalacion: Date;
  public readonly fecha_caducidad: Date;
  public readonly proveedor: string;
  public readonly is_active: boolean;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: SoftwareProps) {
    this.id_software = props.id_software;
    this.nombre_software = props.nombre_software;
    this.licencia = props.licencia;
    this.correo = props.correo;
    this.password = props.password;
    this.fecha_instalacion = props.fecha_instalacion;
    this.fecha_caducidad = props.fecha_caducidad;
    this.proveedor = props.proveedor;
    this.is_active = props.is_active ?? true;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }
}