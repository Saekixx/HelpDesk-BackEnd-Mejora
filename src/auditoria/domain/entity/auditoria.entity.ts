export interface AuditoriaProps {
  id_auditoria?: number;
  id_ticket?: number | null;
  id_cita?: number | null;
  id_usuario: number;
  tipo_evento: string; // Ej: 'TICKET_CERRADO', 'TICKET_REABIERTO'
  payload: Record<string, any>; // Metadatos dinámicos en formato JSON
  createdAt?: Date;
}

export class Auditoria {
  public readonly id_auditoria?: number;
  public readonly id_ticket?: number | null;
  public readonly id_cita?: number | null;
  public readonly id_usuario: number;
  public readonly tipo_evento: string;
  public readonly payload: Record<string, any>;
  public readonly createdAt: Date;

  constructor(props: AuditoriaProps) {
    this.id_auditoria = props.id_auditoria;
    this.id_ticket = props.id_ticket ?? null;
    this.id_cita = props.id_cita ?? null;
    this.id_usuario = props.id_usuario;
    this.tipo_evento = props.tipo_evento;
    this.payload = props.payload;
    this.createdAt = props.createdAt ?? new Date();
  }

  /**
   * Método de fábrica o validación de dominio si fuera necesario
   */
  public static create(props: AuditoriaProps): Auditoria {
    // Aquí puedes agregar validaciones de negocio relativas a la auditoría
    if (!props.tipo_evento) {
      throw new Error('El tipo de evento de auditoría es obligatorio.');
    }
    if (!props.id_usuario) {
      throw new Error(
        'El ID de usuario es obligatorio para registrar una auditoría.',
      );
    }
    return new Auditoria(props);
  }
}
