export class Rol {
  constructor(
    public readonly id_rol: number | null = null,
    public readonly nombre: string,

    public readonly createdAt: Date = new Date(),
  ) {}
}
