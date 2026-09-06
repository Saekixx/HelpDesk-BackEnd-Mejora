export enum TipoCliente {
  JURIDICA = 'JURIDICA',
  NATURAL = 'NATURAL',
}

export class Cliente {
  constructor(
    public readonly id: string,
    public readonly tipo_cliente: TipoCliente,
    public readonly numero_documento: string,
    public readonly direccion: string,
    public readonly telefono: string,
    public readonly correo: string,
    public readonly rubro: string,
    public readonly is_active: boolean,

    public readonly id_plan: number,

    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {}
}
