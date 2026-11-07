import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/common/infrastructure/prisma/prisma.service';
import {
  CITA_SOPORTE_REPOSITORY,
  CitaSoporteRepositoryPort,
} from '@/citas/domain/port/cita-soporte.repository.port';
import {
  SOFT_LOCK_REPOSITORY,
  SoftLockRepositoryPort,
} from '@/citas/domain/port/soft-lock.repository.port';
import { CitaSoporte } from '@/citas/domain/entity/cita-soporte.entity';

@Injectable()
export class CreateCitaAndDerivateTicketUseCase {
  constructor(
    @Inject(CITA_SOPORTE_REPOSITORY)
    private readonly citaRepository: CitaSoporteRepositoryPort,
    @Inject(SOFT_LOCK_REPOSITORY)
    private readonly softLockRepository: SoftLockRepositoryPort,
    private readonly prisma: PrismaService,
  ) {}

  async execute(dto: {
    lock_token: string;
    id_ticket: number;
    id_sucursal: number;
    observaciones?: string;
  }): Promise<CitaSoporte> {
    // Buscar el SoftLock por su token
    const softLock = await this.softLockRepository.findByToken(dto.lock_token);

    if (!softLock) {
      throw new NotFoundException(
        'El token de bloqueo (SoftLock) no es válido o no existe.',
      );
    }

    // Validar si el SoftLock ha expirado (TTL de 5 minutos)
    if (softLock.isExpired()) {
      throw new BadRequestException(
        'El tiempo de reserva temporal (SoftLock) ha expirado. Debe seleccionar la franja nuevamente.',
      );
    }

    // Mapear la franja de texto (ej. "09:00 - 12:00") a objetos Date de tipo Time para la base de datos
    const { horaInicio, horaFin } = this.mapearFranjaAHoras(softLock.franja);

    // Ejecutar la transacción atómica (Crear Cita, Actualizar Ticket y Eliminar SoftLock)
    const result = await this.prisma.$transaction(async (prismaTx) => {
      // A. Crear la entidad de dominio de la Cita de Soporte
      const nuevaCita = CitaSoporte.create({
        id_ticket: dto.id_ticket,
        id_tecnico: softLock.id_tecnico,
        id_sucursal: dto.id_sucursal,
        fecha_programada: softLock.fecha,
        hora_inicio: horaInicio,
        hora_fin: horaFin,
        estado: 'Pendiente',
        observaciones: dto.observaciones ?? null,
      });

      // B. Persistir la cita oficial usando el repositorio de dominio
      const citaGuardada = await this.citaRepository.save(nuevaCita);

      // C. Actualizar el estado del Ticket a "Derivado InSitu" y asignarle el técnico responsable
      await prismaTx.tickets.update({
        where: { id_tickets: dto.id_ticket },
        data: {
          estado: 'Derivado_InSitu',
          id_soporte: softLock.id_tecnico, // Asigna formalmente al técnico in-situ
        },
      });

      // D. Consumir y eliminar el SoftLock ya que cumplió su propósito
      await this.softLockRepository.deleteByToken(dto.lock_token);

      return citaGuardada;
    });

    return result;
  }

  private mapearFranjaAHoras(franja: string): {
    horaInicio: Date;
    horaFin: Date;
  } {
    // Ejemplo de franja: "09:00 - 12:00"
    const partes = franja.split('-').map((p) => p.trim());
    const [hInicio, mInicio] = partes[0].split(':');
    const [hFin, mFin] = partes[1].split(':');

    // Creamos fechas base (1970-01-01) para almacenar únicamente el formato Time en la BD
    const horaInicio = new Date(`1970-01-01T${hInicio}:${mInicio}:00Z`);
    const horaFin = new Date(`1970-01-01T${hFin}:${mFin}:00Z`);

    return { horaInicio, horaFin };
  }
}
