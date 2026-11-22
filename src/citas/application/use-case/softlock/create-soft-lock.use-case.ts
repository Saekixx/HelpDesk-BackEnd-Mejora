import { SoftLock } from '@/citas/domain/entity/soft-lock.entity';
import {
  SOFT_LOCK_REPOSITORY,
  SoftLockRepositoryPort,
} from '@/citas/domain/port/soft-lock.repository.port';
import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class CreateSoftLockUseCase {
  constructor(
    @Inject(SOFT_LOCK_REPOSITORY)
    private readonly softLockRepository: SoftLockRepositoryPort,
  ) {}

  async execute(dto: {
    id_tecnico: number;
    fecha: string;
    franja: string;
  }): Promise<{ lock_token: string; expires_at: Date }> {
    const fechaDate = new Date(`${dto.fecha}T00:00:00`);

    // Validar si ya existe un SoftLock activo para esa misma fecha y franja en ese técnico
    const locksActivos = await this.softLockRepository.findByTecnicoAndFecha(
      dto.id_tecnico,
      fechaDate,
    );

    const bloqueadoEnFranja = locksActivos.some(
      (lock) => lock.franja === dto.franja && !lock.isExpired(),
    );

    // Si ya existe un SoftLock activo para esa franja, lanzar una excepción
    if (bloqueadoEnFranja) {
      throw new BadRequestException(
        'Esta franja horaria ya se encuentra bloqueada temporalmente por otro proceso. Intente con otra o espere unos minutos.',
      );
    }

    // Generar un token único de bloqueo (lock_token)
    const lock_token = crypto.randomUUID();

    // Definir la expiración (TTL de 5 minutos a partir de este instante)
    const expires_at = new Date();
    expires_at.setMinutes(expires_at.getMinutes() + 5);

    // Crear la entidad de dominio SoftLock
    const softLock = SoftLock.create({
      id_tecnico: dto.id_tecnico,
      fecha: fechaDate,
      franja: dto.franja,
      lock_token,
      expires_at,
    });

    // Persistir en la base de datos
    await this.softLockRepository.save(softLock);

    // Retornar el token y su fecha de expiración para que el cliente lo use al confirmar la cita
    return {
      lock_token,
      expires_at,
    };
  }
}
