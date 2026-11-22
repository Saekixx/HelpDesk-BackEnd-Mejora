// src/modules/citas/application/use-cases/create-cita-and-derivate-ticket.use-case.ts
import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import {
  CITA_SOPORTE_REPOSITORY,
  CitaSoporteRepositoryPort,
} from '@/citas/domain/port/cita-soporte.repository.port';
import {
  SOFT_LOCK_REPOSITORY,
  SoftLockRepositoryPort,
} from '@/citas/domain/port/soft-lock.repository.port';
import { CitaSoporte } from '@/citas/domain/entity/cita-soporte.entity';
import { DerivateTicketToInSituUseCase } from '@/tickets/application/use-cases/derivate-ticket-to-insitu.use-case';
import { RegisterDerivationAuditUseCase } from '@/auditoria/application/use-case/register-derivation-audit.use-case';
import { CreateCitaDto } from '../../dtos/citas/create-cita.dto';

@Injectable()
export class CreateCitaAndDerivateTicketUseCase {
  constructor(
    @Inject(CITA_SOPORTE_REPOSITORY)
    private readonly citaRepository: CitaSoporteRepositoryPort,
    @Inject(SOFT_LOCK_REPOSITORY)
    private readonly softLockRepository: SoftLockRepositoryPort,
    private readonly derivateTicketUseCase: DerivateTicketToInSituUseCase,
    private readonly registerDerivationAuditUseCase: RegisterDerivationAuditUseCase,
  ) {}

  async execute(dto: CreateCitaDto): Promise<CitaSoporte> {
    // 1. Buscar y validar el SoftLock
    const softLock = await this.softLockRepository.findByToken(dto.lock_token);

    if (!softLock) {
      throw new NotFoundException(
        'El token de bloqueo (SoftLock) no es válido o no existe.',
      );
    }

    if (softLock.isExpired()) {
      throw new BadRequestException(
        'El tiempo de reserva temporal (SoftLock) ha expirado. Debe seleccionar la franja nuevamente.',
      );
    }

    // 2. Mapear la franja horaria
    const { horaInicio, horaFin } = this.mapearFranjaAHoras(softLock.franja);

    // 3. Crear y persistir la Cita de Soporte
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

    const citaGuardada = await this.citaRepository.save(nuevaCita);

    // 4. Derivar el Ticket a In-Situ y obtener su estado previo y técnico remoto
    const { ticket: ticketActualizado, estadoAnterior } =
      await this.derivateTicketUseCase.execute(dto.id_ticket);

    // 5. Registrar la auditoría con datos completos del Ticket (remoto) y la Cita (in-situ)
    await this.registerDerivationAuditUseCase.execute({
      id_ticket: ticketActualizado.id_tickets!,
      id_usuario: dto.id_usuario,
      id_tecnico_remoto: ticketActualizado.id_soporte ?? null,
      estado_anterior: estadoAnterior,
      estado_nuevo: String(ticketActualizado.estado),
      motivo_derivacion: dto.observaciones,
      cita_insitu: {
        id_cita: citaGuardada.id_cita!,
        fecha_programada: citaGuardada.fecha_programada
          .toISOString()
          .split('T')[0],
        estado_cita: String(citaGuardada.estado),
        observaciones:
          citaGuardada.observaciones || 'Sin observaciones registradas.',
        id_tecnico: citaGuardada.id_tecnico,
      },
    });

    // 6. Eliminar el SoftLock utilizado
    await this.softLockRepository.deleteByToken(dto.lock_token);

    return citaGuardada;
  }

  private mapearFranjaAHoras(franja: string): {
    horaInicio: Date;
    horaFin: Date;
  } {
    const partes = franja.split('-').map((p) => p.trim());
    const [hInicio, mInicio] = partes[0].split(':');
    const [hFin, mFin] = partes[1].split(':');

    const horaInicio = new Date(`1970-01-01T${hInicio}:${mInicio}:00Z`);
    const horaFin = new Date(`1970-01-01T${hFin}:${mFin}:00Z`);

    return { horaInicio, horaFin };
  }
}
