export interface HardwareProps{
    id_hardware?: number;
    tipo_equipo : string;
    numero_serie: string;
    fecha_compra: Date;
    marca: string;
    proveedor : string;
    descripcion?: string;
    ult_revision?: Date;
    rev_programada?: Date;
    is_active : boolean;
    created_at?: Date;
    updated_at?: Date;
}

export class Hardware{
    public readonly id_hardware?: number;
    public readonly tipo_equipo: string;
    public readonly numero_serie: string;
    public readonly fecha_compra: Date;
    public readonly marca: string;
    public readonly proveedor: string;
    public readonly descripcion?: string;
    public readonly ult_revision?: Date;
    public readonly rev_programada?: Date;
    public readonly is_active : boolean;
    public readonly created_at? : Date;
    public readonly updated_at? : Date;

    constructor(props: HardwareProps){
        this.id_hardware = props.id_hardware;
        this.tipo_equipo = props.tipo_equipo;
        this.numero_serie = props.numero_serie;
        this.fecha_compra = props.fecha_compra;
        this.marca = props.marca;
        this.proveedor = props.proveedor;
        this.descripcion = props.descripcion;
        this.ult_revision = props.ult_revision;
        this.rev_programada = props.rev_programada;
        this.is_active = props.is_active;
        this.created_at = props.created_at ?? new Date();
        this.updated_at = props.updated_at ?? new Date();
    }
}
