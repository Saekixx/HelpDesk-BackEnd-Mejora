export class Plan {
  constructor(
    public readonly id: string,
    public readonly numero_plan: number,
    public readonly tipo: string,
    public readonly servicio: string[], // Array de strings para los servicios
    public readonly precio: number,
    public readonly limite_equipos: number,
    public readonly is_active: boolean,

    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {}
}
