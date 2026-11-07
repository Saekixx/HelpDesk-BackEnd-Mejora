import { SoftLock } from '@/citas/domain/entity/soft-lock.entity';
import { soft_locks as SoftLockModel } from '@prisma/client';

export class SoftLockMapper {
  static toDomain(raw: SoftLockModel): SoftLock {
    return new SoftLock({
      id_lock: raw.id_lock,
      id_tecnico: raw.id_tecnico,
      fecha: raw.fecha,
      franja: raw.franja,
      lock_token: raw.lock_token,
      expires_at: raw.expires_at,
      createdAt: raw.created_at ?? undefined,
    });
  }

  static toPersistence(
    domain: SoftLock,
  ): Omit<SoftLockModel, 'id_lock' | 'created_at'> {
    return {
      id_tecnico: domain.id_tecnico,
      fecha: domain.fecha,
      franja: domain.franja,
      lock_token: domain.lock_token,
      expires_at: domain.expires_at,
    };
  }
}
