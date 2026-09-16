export enum EstadoTicket {
  PENDIENTE = 'Pendiente',
  ASIGNADO = 'Asignado',
  EN_PROGRESO = 'En Progreso',
  REABIERTO = 'Reabierto',
  CERRADO = 'Cerrado',
}

export interface TicketProps {
  id_tickets?: number;
  pin: string;
  asunto: string;
  detalle: string;
  estado?: EstadoTicket;
  id_equipo: number;
  id_trabajador: number;
  id_soporte?: number;
  es_software?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Ticket {
  public readonly id_tickets?: number;
  public readonly pin: string;
  public readonly asunto: string;
  public readonly detalle: string;
  public readonly estado: EstadoTicket;
  public readonly id_equipo: number;
  public readonly id_cliente: number;
  public readonly id_trabajador: number;
  public readonly id_soporte?: number;
  public readonly id_software?: number;
  public readonly es_software: boolean;
  public readonly imagen_url?: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: TicketProps) {
    this.id_tickets = props.id_tickets;
    this.pin = props.pin;
    this.asunto = props.asunto;
    this.detalle = props.detalle;
    this.estado = props.estado ?? EstadoTicket.PENDIENTE;
    this.id_equipo = props.id_equipo;
    this.id_trabajador = props.id_trabajador;
    this.id_soporte = props.id_soporte;
    this.es_software = props.es_software ?? false;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }
}
