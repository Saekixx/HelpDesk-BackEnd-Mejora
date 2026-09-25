import { TicketState } from './states/ticket-state.interface';
import { PendienteState } from './states/pendiente.state';
import { AsignadoState } from './states/asignado.state';
import { EnProgresoState } from './states/en-progreso.state';
import { CerradoState } from './states/cerrado.state';
import { ReabiertoState } from './states/reabierto.state';

export enum EstadoTicket {
  PENDIENTE = 'Pendiente',
  ASIGNADO = 'Asignado',
  EN_PROGRESO = 'En Progreso',
  REABIERTO = 'Reabierto',
  CERRADO = 'Cerrado',
}

export enum RolUsuario {
  ADMINISTRADOR = 'ADMINISTRADOR',
  SOPORTE_TECNICO = 'SOPORTE_TECNICO',
  SOPORTE_INSITU = 'SOPORTE_INSITU',
  CLIENTE_EMPRESA = 'CLIENTE_EMPRESA',
  CLIENTE_SUCURSAL = 'CLIENTE_SUCURSAL',
  CLIENTE_TRABAJADOR = 'CLIENTE_TRABAJADOR',
}

export interface TicketProps {
  id_tickets?: number;
  pin: string;
  asunto: string;
  detalle: string;
  estado?: EstadoTicket;
  id_equipo: number;
  id_trabajador: number;
  id_soporte?: number | null;
  es_software?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Ticket {
  public readonly id_tickets?: number;
  public readonly pin: string;
  public readonly asunto: string;
  public readonly detalle: string;
  public readonly id_equipo: number;
  public readonly id_trabajador: number;
  public readonly es_software: boolean;
  public readonly createdAt: Date;

  private _id_soporte?: number | null;
  private _state: TicketState;
  private _updatedAt: Date;

  constructor(props: TicketProps) {
    this.id_tickets = props.id_tickets;
    this.pin = props.pin;
    this.asunto = props.asunto;
    this.detalle = props.detalle;
    this.id_equipo = props.id_equipo;
    this.id_trabajador = props.id_trabajador;
    this._id_soporte = props.id_soporte ?? null;
    this.es_software = props.es_software ?? false;
    this.createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();

    this._state = this.resolveStateInstance(
      props.estado ?? EstadoTicket.PENDIENTE,
    );
  }

  public get id_soporte(): number | null | undefined {
    return this._id_soporte;
  }

  public get estado(): EstadoTicket {
    return this._state.name as EstadoTicket;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  public changeState(newState: TicketState): void {
    this._state = newState;
    this._updatedAt = new Date();
  }

  public setIdSoporte(idSoporte: number): void {
    this._id_soporte = idSoporte;
  }

  public puedeSerCerradoPor(
    usuarioId: number,
    rol: RolUsuario | string,
  ): boolean {
    if (rol === RolUsuario.ADMINISTRADOR) return true;

    const esSoporte =
      rol === RolUsuario.SOPORTE_TECNICO || rol === RolUsuario.SOPORTE_INSITU;

    if (esSoporte) {
      return this._id_soporte === usuarioId;
    }

    const esCliente =
      rol === RolUsuario.CLIENTE_EMPRESA ||
      rol === RolUsuario.CLIENTE_SUCURSAL ||
      rol === RolUsuario.CLIENTE_TRABAJADOR;

    if (esCliente) {
      return this.id_trabajador === usuarioId;
    }

    return false;
  }

  public puedeSerReabiertoPor(
    usuarioId: number,
    rol: RolUsuario | string,
  ): boolean {
    if (rol === RolUsuario.ADMINISTRADOR) return true;

    const esCliente =
      rol === RolUsuario.CLIENTE_EMPRESA ||
      rol === RolUsuario.CLIENTE_SUCURSAL ||
      rol === RolUsuario.CLIENTE_TRABAJADOR;

    return esCliente && this.id_trabajador === usuarioId;
  }

  public asignarSoporte(idSoporte: number): void {
    this._state.asignarSoporte(this, idSoporte);
  }

  public iniciarChat(): void {
    this._state.iniciarChat(this);
  }

  public cerrar(): void {
    this._state.cerrar(this);
  }

  public reabrir(): void {
    this._state.reabrir(this);
  }

  private resolveStateInstance(estado: EstadoTicket): TicketState {
    switch (estado) {
      case EstadoTicket.PENDIENTE:
        return new PendienteState();
      case EstadoTicket.ASIGNADO:
        return new AsignadoState();
      case EstadoTicket.EN_PROGRESO:
        return new EnProgresoState();
      case EstadoTicket.CERRADO:
        return new CerradoState();
      case EstadoTicket.REABIERTO:
        return new ReabiertoState();
      default:
        return new PendienteState();
    }
  }
}
