export interface PlanProps {
  id_plan?: number;
  numero_plan: number;
  tipo: string;
  servicio: string[];
  precio: number;
  limite_equipos: number;
  is_active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Plan {
  public readonly id_plan?: number;
  public readonly numero_plan: number;
  public readonly tipo: string;
  public readonly servicio: string[];
  public readonly precio: number;
  public readonly limite_equipos: number;
  public readonly is_active: boolean;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: PlanProps) {
    this.id_plan = props.id_plan;
    this.numero_plan = props.numero_plan;
    this.tipo = props.tipo;
    this.servicio = props.servicio;
    this.precio = props.precio;
    this.limite_equipos = props.limite_equipos;
    this.is_active = props.is_active;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }
}
