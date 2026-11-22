export type CitaEstado =
  'Pendiente' | 'En_Camino' | 'Completada' | 'Cancelada' | 'Reprogramada';

export interface CitaSoporteProps {
  id_cita?: number;
  id_ticket: number;
  id_tecnico: number;
  id_sucursal: number;
  fecha_programada: Date;
  hora_inicio: Date;
  hora_fin?: Date | null;
  estado: CitaEstado | null;
  observaciones?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class CitaSoporte {
  public readonly id_cita?: number;
  public readonly id_ticket: number;
  public readonly id_tecnico: number;
  public readonly id_sucursal: number;
  public readonly fecha_programada: Date;
  public readonly hora_inicio: Date;
  public readonly hora_fin: Date | null;
  public private_estado: CitaEstado;
  public private_observaciones: string | null;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: CitaSoporteProps) {
    this.id_cita = props.id_cita;
    this.id_ticket = props.id_ticket;
    this.id_tecnico = props.id_tecnico;
    this.id_sucursal = props.id_sucursal;
    this.fecha_programada = props.fecha_programada;
    this.hora_inicio = props.hora_inicio;
    this.hora_fin = props.hora_fin ?? null;
    this.private_estado = props.estado ?? 'Pendiente';
    this.private_observaciones = props.observaciones ?? null;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  get estado(): CitaEstado {
    return this.private_estado;
  }

  get observaciones(): string | null {
    return this.private_observaciones;
  }

  /**
   * Regla de negocio: Completar cita con observaciones del diagnóstico físico
   */
  public completar(observaciones: string): void {
    if (this.private_estado === 'Completada') {
      throw new Error('La cita ya se encuentra completada.');
    }
    if (this.private_estado === 'Cancelada') {
      throw new Error('No se puede completar una cita que ha sido cancelada.');
    }
    this.private_estado = 'Completada';
    this.private_observaciones = observaciones;
  }

  public static create(props: CitaSoporteProps): CitaSoporte {
    if (!props.id_ticket || !props.id_tecnico || !props.id_sucursal) {
      throw new Error(
        'Ticket, técnico y sucursal son obligatorios para crear una cita.',
      );
    }
    return new CitaSoporte(props);
  }
}
