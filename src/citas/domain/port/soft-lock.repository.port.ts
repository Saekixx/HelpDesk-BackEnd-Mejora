import { SoftLock } from '../entity/soft-lock.entity';

export const SOFT_LOCK_REPOSITORY = 'SOFT_LOCK_REPOSITORY';

export interface SoftLockRepositoryPort {
  /**
   * Buscar un SoftLock por su token de bloqueo (lock_token). Retorna null si no se encuentra.
   */
  findByToken(token: string): Promise<SoftLock | null>;

  /**
   * Buscar todos los SoftLocks activos y vigentes para un técnico en una fecha específica.
   */
  findByTecnicoAndFecha(id_tecnico: number, fecha: Date): Promise<SoftLock[]>;

  /**
   * Guardar o Actualizar un SoftLock en la base de datos.
   */
  save(softLock: SoftLock): Promise<SoftLock>;

  /**
   * Eliminar un SoftLock por su token de bloqueo (lock_token).
   */
  deleteByToken(token: string): Promise<void>;

  /**
   * Eliminar todos los SoftLocks que hayan expirado.
   */
  deleteExpired(): Promise<void>;
}
