export class User {
  constructor(
    public readonly id_usuario: number | null = null,
    public readonly nombre: string,
    public readonly apellido: string,
    public readonly correo: string,
    public readonly password: string,
    public readonly telefono: string,
    public readonly is_active: boolean,

    public readonly id_rol: number,
    public readonly id_cliente: number | null,
    public readonly id_sucursal: number | null,
    public readonly id_area: number | null,

    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {}
}
