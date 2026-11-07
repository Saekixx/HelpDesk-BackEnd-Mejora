import { TicketState } from './states/ticket-state.interface';
import { PendienteState } from './states/pendiente.state';
import { AsignadoState } from './states/asignado.state';
import { EnProgresoState } from './states/en-progreso.state';
import { CerradoState } from './states/cerrado.state';
import { ReabiertoState } from './states/reabierto.state';
import { DerivadoInsituState } from './states/derivado-insitu.state';
import { EnEsperaRepuestoState } from './states/en-espera-repuesto';

/**
 * Enumeración que define los diferentes estados posibles de un Ticket
 * dentro del flujo de soporte técnico del sistema Helpdesk.
 */
export enum EstadoTicket {
  PENDIENTE = 'Pendiente',
  ASIGNADO = 'Asignado',
  EN_PROGRESO = 'En Progreso',
  REABIERTO = 'Reabierto',
  CERRADO = 'Cerrado',
  DERIVADO_INSITU = 'Derivado InSitu',
  EN_ESPERA_REPUESTO = 'En Espera Repuesto',
}

/**
 * Enumeración que define los roles de usuario disponibles en el sistema,
 * utilizados para validar permisos de acciones sobre los tickets.
 */
export enum RolUsuario {
  ADMINISTRADOR = 'ADMINISTRADOR',
  SOPORTE_TECNICO = 'SOPORTE_TECNICO',
  SOPORTE_INSITU = 'SOPORTE_INSITU',
  CLIENTE_EMPRESA = 'CLIENTE_EMPRESA',
  CLIENTE_SUCURSAL = 'CLIENTE_SUCURSAL',
  CLIENTE_TRABAJADOR = 'CLIENTE_TRABAJADOR',
}

/**
 * Interfaz que define las propiedades necesarias para la creación
 * o hidratación de una entidad Ticket en el dominio.
 */
export interface TicketProps {
  id_tickets?: number;
  pin: string;
  asunto: string;
  detalle: string;
  estado?: EstadoTicket;
  reporte_cierre?: string;
  id_equipo: number;
  id_trabajador: number;
  id_soporte?: number | null;
  es_software?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Entidad principal de Dominio que encapsula las reglas de negocio
 * y el comportamiento del ciclo de vida de un Ticket de soporte.
 */
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
  private _reporte_cierre?: string;

  /**
   * Constructor de la entidad Ticket.
   * Inicializa las propiedades básicas y resuelve la instancia del patrón State según su estado actual.
   */
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
    this._reporte_cierre = props.reporte_cierre;

    // Resuelve el objeto de estado inicial utilizando el patrón State
    this._state = this.resolveStateInstance(
      props.estado ?? EstadoTicket.PENDIENTE,
    );
  }

  /** Retorna el ID del soporte técnico asignado actualmente. */
  public get id_soporte(): number | null | undefined {
    return this._id_soporte;
  }

  /** Retorna el nombre del estado actual del ticket mediante el patrón State. */
  public get estado(): EstadoTicket {
    return this._state.name as EstadoTicket;
  }

  /** Retorna la fecha de la última actualización del ticket. */
  public get updatedAt(): Date {
    return this._updatedAt;
  }

  /** Retorna el reporte de cierre registrado en el ticket. */
  public get reporte_cierre(): string | undefined {
    return this._reporte_cierre;
  }

  /**
   * Cambia el estado actual del ticket y actualiza la marca de tiempo de modificación.
   * @param newState Nueva instancia de TicketState
   */
  public changeState(newState: TicketState): void {
    this._state = newState;
    this._updatedAt = new Date();
  }

  /**
   * Asigna o reasigna un ID de soporte técnico al ticket y actualiza la fecha de modificación.
   * @param idSoporte ID del técnico de soporte
   */
  public setIdSoporte(idSoporte: number): void {
    this._id_soporte = idSoporte;
    this._updatedAt = new Date();
  }

  /**
   * Establece o actualiza el reporte de cierre del ticket.
   * @param reporte Texto descriptivo de la solución aplicada
   */
  public setReporteCierre(reporte: string): void {
    this._reporte_cierre = reporte;
    this._updatedAt = new Date();
  }

  /**
   * Evalúa si un usuario específico, de acuerdo con su rol e ID, tiene permisos para cerrar el ticket.
   * - Los administradores pueden cerrar cualquier ticket.
   * - El personal de soporte técnico/insitu solo si están asignados a este ticket.
   * - Los clientes/trabajadores solo si son los creadores del ticket.
   */
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

  /**
   * Evalúa si un usuario específico tiene permisos para reabrir un ticket cerrado.
   * Permitido para Administradores o para el trabajador creador del ticket.
   */
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

  /** Delega la acción de derivar a insitu al estado actual. */
  public derivarInsitu(): void {
    this._state.derivarInsitu(this);
  }

  /** Delega la acción de asignar soporte al estado actual. */
  public asignarSoporte(idSoporte: number): void {
    this._state.asignarSoporte(this, idSoporte);
  }

  /** Delega la acción de iniciar el chat al estado actual. */
  public iniciarChat(): void {
    this._state.iniciarChat(this);
  }

  /**
   * Ejecuta el cierre del ticket. Opcionalmente actualiza el reporte de cierre antes de cambiar el estado.
   * @param reporteCierre Texto opcional con la solución final
   */
  public cerrar(reporteCierre?: string): void {
    if (reporteCierre) {
      this.setReporteCierre(reporteCierre);
    }
    this._state.cerrar(this);
  }

  /** Delega la acción de reabrir el ticket al estado actual. */
  public reabrir(): void {
    this._state.reabrir(this);
  }

  /** Delega la acción de pasar a espera de repuesto al estado actual. */
  public enEsperaRepuesto(): void {
    this._state.enEsperaRepuesto(this);
  }

  /**
   * Fábrica interna para resolver y retornar la instancia de clase de estado
   * correspondiente basándose en el enumerado `EstadoTicket`.
   */
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
      case EstadoTicket.DERIVADO_INSITU:
        return new DerivadoInsituState();
      case EstadoTicket.EN_ESPERA_REPUESTO:
        return new EnEsperaRepuestoState();
      default:
        return new PendienteState();
    }
  }
}
