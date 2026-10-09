export interface ZonaProps {
  id_zona?: number;
  nombre_zona: string;
  descripcion: string;
  is_active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Zona {
  public readonly id_zona?: number;
  public readonly nombre_zona: string;
  public readonly descripcion: string;
  public readonly is_active: boolean;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: ZonaProps) {
    this.id_zona = props.id_zona;
    this.nombre_zona = props.nombre_zona;
    this.descripcion = props.descripcion;
    this.is_active = props.is_active;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }
}
