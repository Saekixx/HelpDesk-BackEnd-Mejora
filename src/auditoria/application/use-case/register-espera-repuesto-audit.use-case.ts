// src/modules/auditoria/application/use-cases/register-spare-part-wait-audit.use-case.ts
import { Inject, Injectable } from '@nestjs/common';
import {
  AuditoriaRepositoryPort,
  AUDITORIA_REPOSITORY,
} from '@/auditoria/domain/port/auditoria.repository.port';
import { Auditoria } from '@/auditoria/domain/entity/auditoria.entity';
import { RegisterSparePartWaitAuditDto } from '../dtos/RegisterSparePartWaitAudit.dto';

/**
 * Caso de uso para registrar un evento de auditoría cuando un ticket entra en estado de espera por repuesto.
 */

@Injectable()
export class RegisterEsperaRepuestoAuditUseCase {
  constructor(
    @Inject(AUDITORIA_REPOSITORY)
    private readonly auditoriaRepository: AuditoriaRepositoryPort,
  ) {}

  async execute(dto: RegisterSparePartWaitAuditDto): Promise<Auditoria> {
    const auditoria = Auditoria.create({
      id_ticket: dto.id_ticket,
      id_cita: dto.cita_insitu.id_cita,
      id_usuario: dto.id_usuario,
      tipo_evento: 'TICKET_EN_ESPERA_REPUESTO', // Tipo de evento para indicar que el ticket está en espera de repuesto
      payload: {
        estado_anterior: dto.estado_anterior,
        estado_nuevo: dto.estado_nuevo,
        tipo_intervencion: 'INSITU', // Tipo de intervención para indicar que la visita fue presencial
        detalles_ticket: {
          reporte_cierre: null,
          motivo_reapertura: null,
        },
        detalles_cita_insitu: {
          id_cita: dto.cita_insitu.id_cita,
          fecha_programada: dto.cita_insitu.fecha_programada,
          estado_cita: dto.cita_insitu.estado_cita,
          observaciones: dto.cita_insitu.observaciones,
          id_tecnico: dto.cita_insitu.id_tecnico,
        },
      },
    });

    return await this.auditoriaRepository.save(auditoria);
  }
}
