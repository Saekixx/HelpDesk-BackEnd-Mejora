// src/modules/auditoria/application/services/auditoria-context.resolver.ts
import { Inject, Injectable } from '@nestjs/common';
import {
  CITA_SOPORTE_REPOSITORY,
  CitaSoporteRepositoryPort,
} from '@/citas/domain/port/cita-soporte.repository.port';
import { CitaInsituPayloadDto } from '../dtos/CitaInsituPayload.dto';

@Injectable()
export class AuditoriaContextResolver {
  constructor(
    @Inject(CITA_SOPORTE_REPOSITORY)
    private readonly citaSoporteRepository: CitaSoporteRepositoryPort,
  ) {}

  async resolveUltimaCita(
    idTicket: number,
  ): Promise<CitaInsituPayloadDto | null> {
    const ultimaCita =
      await this.citaSoporteRepository.hasAppointment(idTicket);

    if (!ultimaCita) {
      return null;
    }

    return {
      id_cita: ultimaCita.id_cita!,
      fecha_programada: ultimaCita.fecha_programada.toISOString().split('T')[0],
      estado_cita: String(ultimaCita.estado || 'Completada'),
      observaciones:
        ultimaCita.observaciones || 'Sin observaciones previas en cita.',
      id_tecnico: ultimaCita.id_tecnico,
    };
  }
}
