// src/modules/auditoria/application/use-cases/register-reopening-audit.use-case.ts
import { Inject, Injectable } from '@nestjs/common';
import {
  AuditoriaRepositoryPort,
  AUDITORIA_REPOSITORY,
} from '@/auditoria/domain/port/auditoria.repository.port';
import { Auditoria } from '@/auditoria/domain/entity/auditoria.entity';
import { RegisterReopeningAuditDto } from '../dtos/RegisterReopeningAudit.dto';

/**
 * Caso de uso para registrar un evento de auditoría al reabrir un ticket.
 */
@Injectable()
export class RegisterReopeningAuditUseCase {
  constructor(
    @Inject(AUDITORIA_REPOSITORY)
    private readonly auditoriaRepository: AuditoriaRepositoryPort,
  ) {}

  async execute(dto: RegisterReopeningAuditDto): Promise<Auditoria> {
    const auditoria = Auditoria.create({
      id_ticket: dto.id_ticket,
      id_cita: dto.ultima_cita_insitu?.id_cita || null, // Vinculamos la cita previa si existió
      id_usuario: dto.id_usuario,
      tipo_evento: 'TICKET_REABIERTO',
      payload: {
        estado_anterior: dto.estado_anterior,
        estado_nuevo: dto.estado_nuevo,
        tipo_intervencion: dto.ultima_cita_insitu ? 'INSITU_PREVIO' : 'REMOTO',
        detalles_ticket: {
          reporte_cierre: dto.ultimo_reporte_cierre || null,
          motivo_reapertura: dto.motivo_reapertura,
        },
        // Guardamos de forma opcional los datos de la cita anterior para referencia del técnico
        detalles_cita_insitu: dto.ultima_cita_insitu
          ? {
              id_cita: dto.ultima_cita_insitu.id_cita,
              fecha_programada: dto.ultima_cita_insitu.fecha_programada,
              observaciones_previas:
                dto.ultima_cita_insitu.observaciones_previas,
            }
          : null,
      },
    });

    return await this.auditoriaRepository.save(auditoria);
  }
}
