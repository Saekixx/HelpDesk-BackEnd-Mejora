import { SoftLock } from '@/citas/domain/entity/soft-lock.entity';
import { SoftLockRepositoryPort } from '@/citas/domain/port/soft-lock.repository.port';
import { PrismaService } from '@/common/infrastructure/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { SoftLockMapper } from './mapper/soft-lock.mapper';

@Injectable()
export class PrismaSoftLockRepository implements SoftLockRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findByToken(token: string): Promise<SoftLock | null> {
    const record = await this.prisma.soft_locks.findFirst({
      where: { lock_token: token },
    });

    if (!record) return null;
    return SoftLockMapper.toDomain(record);
  }

  async findByTecnicoAndFecha(
    id_tecnico: number,
    fecha: Date,
  ): Promise<SoftLock[]> {
    const records = await this.prisma.soft_locks.findMany({
      where: {
        id_tecnico: Number(id_tecnico),
        fecha: fecha,
      },
    });

    return records.map((record) => SoftLockMapper.toDomain(record));
  }

  async save(softLock: SoftLock): Promise<SoftLock> {
    const data = SoftLockMapper.toPersistence(softLock);

    const record = await this.prisma.soft_locks.create({
      data,
    });

    return SoftLockMapper.toDomain(record);
  }

  async deleteByToken(token: string): Promise<void> {
    await this.prisma.soft_locks.deleteMany({
      where: { lock_token: token },
    });
  }

  async deleteExpired(): Promise<void> {
    await this.prisma.soft_locks.deleteMany({
      where: { expires_at: { lt: new Date() } },
    });
  }
}
