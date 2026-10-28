export class AreaEntity {
  constructor(
    public readonly id_area: number,
    public readonly codigo_area: string,
    public readonly nombre_area: string,
    public readonly id_sucursal: number,
    public readonly contacto_responsable: string | null,
    public readonly telefono: string | null,
    public readonly correo_electronico: string | null,
    public readonly is_active: boolean,
    public readonly nombre_sucursal?: string,
    public readonly nombre_empresa?: string,
    public readonly total_equipos?: number,
    public readonly total_tickets?: number,
    public readonly created_at?: Date,
    public readonly updated_at?: Date,
  ) {}
}