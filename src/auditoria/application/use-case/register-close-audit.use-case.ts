// src/modules/auditoria/application/use-cases/register-closure-audit.use-case.ts
import { Inject, Injectable } from '@nestjs/common';
import {
  AuditoriaRepositoryPort,
  AUDITORIA_REPOSITORY,
} from '@/auditoria/domain/port/auditoria.repository.port';
import { Auditoria } from '@/auditoria/domain/entity/auditoria.entity';
import { RegisterClosureAuditDto } from '../dtos/RegisterClosureAudit.dto';

/**
 * Caso de uso para registrar un evento de auditoría al cerrar un ticket.
 */
@Injectable()
export class RegisterCloseAuditUseCase {
  constructor(
    @Inject(AUDITORIA_REPOSITORY)
    private readonly auditoriaRepository: AuditoriaRepositoryPort,
  ) {}

  async execute(dto: RegisterClosureAuditDto): Promise<Auditoria> {
    const auditoria = Auditoria.create({
      id_ticket: dto.id_ticket,
      id_cita: dto.cita_insitu?.id_cita || null,
      id_usuario: dto.id_usuario,
      tipo_evento: 'TICKET_CERRADO', // Tipo de evento para indicar que el ticket ha sido cerrado
      // El payload contiene información relevante sobre el cierre del ticket y la cita in-situ si aplica
      payload: {
        estado_anterior: dto.estado_anterior,
        estado_nuevo: dto.estado_nuevo,
        tipo_intervencion: dto.tipo_intervencion,
        // Detalles del ticket cerrado, incluyendo el reporte de cierre y el motivo de cierre si se proporciona
        detalles_ticket: {
          reporte_cierre: dto.reporte_cierre,
          motivo_cierre:
            dto.motivo_cierre || 'Solución registrada satisfactoriamente.',
        },
        // Si la intervención fue in-situ, se incluye información de la cita; de lo contrario, se establece como null
        detalles_cita_insitu: dto.cita_insitu
          ? {
              id_cita: dto.cita_insitu.id_cita,
              fecha_programada: dto.cita_insitu.fecha_programada,
              estado_cita: dto.cita_insitu.estado_cita,
              observaciones: dto.cita_insitu.observaciones,
              id_tecnico: dto.cita_insitu.id_tecnico,
            }
          : null,
      },
    });

    return await this.auditoriaRepository.save(auditoria);
  }
}
