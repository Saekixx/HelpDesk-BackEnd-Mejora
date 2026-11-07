export interface SoftLockProps {
  id_lock?: number;
  id_tecnico: number;
  fecha: Date;
  franja: string;
  lock_token: string;
  expires_at: Date;
  createdAt?: Date;
}

export class SoftLock {
  public readonly id_lock?: number;
  public readonly id_tecnico: number;
  public readonly fecha: Date;
  public readonly franja: string;
  public readonly lock_token: string;
  public readonly expires_at: Date;
  public readonly createdAt: Date;

  constructor(props: SoftLockProps) {
    this.id_lock = props.id_lock;
    this.id_tecnico = props.id_tecnico;
    this.fecha = props.fecha;
    this.franja = props.franja;
    this.lock_token = props.lock_token;
    this.expires_at = props.expires_at;
    this.createdAt = props.createdAt ?? new Date();
  }

  /**
   * Valida si el soft lock sigue vigente a partir de la fecha actual
   */
  public isExpired(): boolean {
    return new Date() > this.expires_at;
  }

  public static create(props: SoftLockProps): SoftLock {
    if (!props.lock_token) {
      throw new Error('El token de bloqueo (lock_token) es obligatorio.');
    }
    if (!props.id_tecnico) {
      throw new Error('El ID del técnico es obligatorio para el bloqueo.');
    }
    return new SoftLock(props);
  }
}
