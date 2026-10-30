export enum SoftwareState {
  ACTIVO = 'Activo',
  SUSPENDIDO = 'Suspendido',
  CADUCADO = 'Caducado',
  INACTIVO = 'Inactivo',
}

export interface SoftwareProps {
  id_software?: number;
  id_cliente?: number;
  id_sucursal?: number;
  nombre_software: string;
  categoria?: string;
  tipo_licencia?: string;
  licencia?: string; // Compatibilidad con casos de uso
  correo?: string;   // Compatibilidad con casos de uso
  password?: string; // Compatibilidad con casos de uso
  licencia_master_key?: string;
  proveedor?: string;
  limite_equipos?: number;
  licencias_usadas?: number;
  url_factura?: string;
  fecha_instalacion?: Date; // Compatibilidad con casos de uso
  fecha_compra?: Date;
  fecha_caducidad?: Date;
  estado?: SoftwareState;
  is_active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Software {
  public readonly id_software?: number;
  public readonly id_cliente?: number;
  public readonly id_sucursal?: number;
  public readonly nombre_software: string;
  public readonly categoria?: string;
  public readonly tipo_licencia: string;
  public readonly licencia: string;
  public readonly correo?: string;
  public readonly password?: string;
  public readonly licencia_master_key?: string;
  public readonly proveedor?: string;
  public readonly limite_equipos: number;
  public readonly licencias_usadas: number;
  public readonly url_factura?: string;
  public readonly fecha_instalacion: Date;
  public readonly fecha_compra?: Date;
  public readonly fecha_caducidad?: Date;
  public readonly estado: SoftwareState;
  public readonly is_active: boolean;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: SoftwareProps) {
    this.id_software = props.id_software;
    this.id_cliente = props.id_cliente;
    this.id_sucursal = props.id_sucursal;
    this.nombre_software = props.nombre_software;
    this.categoria = props.categoria;
    this.tipo_licencia = props.tipo_licencia ?? 'Pool_Limitado';
    this.licencia = props.licencia ?? props.tipo_licencia ?? 'Pool_Limitado';
    this.correo = props.correo;
    this.password = props.password;
    this.licencia_master_key = props.licencia_master_key;
    this.proveedor = props.proveedor;
    this.limite_equipos = props.limite_equipos ?? 1;
    this.licencias_usadas = props.licencias_usadas ?? 0;
    this.url_factura = props.url_factura;
    this.fecha_instalacion = props.fecha_instalacion ?? props.fecha_compra ?? new Date();
    this.fecha_compra = props.fecha_compra;
    this.fecha_caducidad = props.fecha_caducidad;
    this.estado = props.estado ?? SoftwareState.ACTIVO;
    this.is_active = props.is_active ?? true;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  // ==========================================
  // PATRÓN STATE: Reglas y transiciones de dominio
  // ==========================================

  public activar(): Software {
    if (this.estado === SoftwareState.ACTIVO) {
      throw new Error('El software ya se encuentra activo.');
    }
    return new Software({
      ...this,
      estado: SoftwareState.ACTIVO,
      is_active: true,
      updatedAt: new Date(),
    });
  }

  public suspender(): Software {
    if (this.estado === SoftwareState.SUSPENDIDO) {
      throw new Error('El software ya se encuentra suspendido.');
    }
    return new Software({
      ...this,
      estado: SoftwareState.SUSPENDIDO,
      updatedAt: new Date(),
    });
  }

  public caducar(): Software {
    if (this.estado === SoftwareState.CADUCADO) {
      throw new Error('El software ya está caducado.');
    }
    return new Software({
      ...this,
      estado: SoftwareState.CADUCADO,
      updatedAt: new Date(),
    });
  }

  public inactivar(): Software {
    if (this.estado === SoftwareState.INACTIVO) {
      throw new Error('El software ya está inactivo.');
    }
    return new Software({
      ...this,
      estado: SoftwareState.INACTIVO,
      is_active: false,
      updatedAt: new Date(),
    });
  }

  public puedeAsignarEquipos(): boolean {
    return this.estado === SoftwareState.ACTIVO;
  }
}