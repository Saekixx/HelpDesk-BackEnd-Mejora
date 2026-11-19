// src/modules/auditoria/application/use-cases/register-derivation-audit.use-case.ts
import { Inject, Injectable } from '@nestjs/common';
import {
  AuditoriaRepositoryPort,
  AUDITORIA_REPOSITORY,
} from '@/auditoria/domain/port/auditoria.repository.port';
import { Auditoria } from '@/auditoria/domain/entity/auditoria.entity';
import { RegisterDerivationAuditDto } from '../dtos/RegisterDerivationAudit.dto';

@Injectable()
export class RegisterDerivationAuditUseCase {
  constructor(
    @Inject(AUDITORIA_REPOSITORY)
    private readonly auditoriaRepository: AuditoriaRepositoryPort,
  ) {}

  async execute(dto: RegisterDerivationAuditDto): Promise<Auditoria> {
    const auditoria = Auditoria.create({
      id_ticket: dto.id_ticket,
      id_cita: dto.cita_insitu.id_cita,
      id_usuario: dto.id_usuario,
      tipo_evento: 'TICKET_DERIVADO_INSITU',
      payload: {
        estado_anterior: dto.estado_anterior,
        estado_nuevo: dto.estado_nuevo,
        tipo_intervencion: 'INSITU',
        responsables: {
          id_tecnico_remoto: dto.id_tecnico_remoto,
          id_tecnico_insitu: dto.cita_insitu.id_tecnico,
        },
        detalles_ticket: {
          motivo_derivacion:
            dto.motivo_derivacion || 'Derivado a atención presencial In-Situ.',
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
