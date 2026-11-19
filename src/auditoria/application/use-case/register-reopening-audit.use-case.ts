// src/modules/auditoria/application/use-cases/register-reopening-audit.use-case.ts
import { Inject, Injectable } from '@nestjs/common';
import {
  AuditoriaRepositoryPort,
  AUDITORIA_REPOSITORY,
} from '@/auditoria/domain/port/auditoria.repository.port';
import { Auditoria } from '@/auditoria/domain/entity/auditoria.entity';
import { RegisterReopeningAuditDto } from '../dtos/RegisterReopeningAudit.dto';
import { AuditoriaContextResolver } from '../service/auditoria-context.resolver';

@Injectable()
export class RegisterReopeningAuditUseCase {
  constructor(
    @Inject(AUDITORIA_REPOSITORY)
    private readonly auditoriaRepository: AuditoriaRepositoryPort,
    private readonly contextResolver: AuditoriaContextResolver,
  ) {}

  async execute(dto: RegisterReopeningAuditDto): Promise<Auditoria> {
    const ultimaCita = await this.contextResolver.resolveUltimaCita(
      dto.id_ticket,
    );

    const auditoria = Auditoria.create({
      id_ticket: dto.id_ticket,
      id_cita: ultimaCita?.id_cita || null,
      id_usuario: dto.id_usuario,
      tipo_evento: 'TICKET_REABIERTO',
      payload: {
        estado_anterior: dto.estado_anterior,
        estado_nuevo: dto.estado_nuevo,
        tipo_intervencion: ultimaCita ? 'INSITU_PREVIO' : 'REMOTO',
        detalles_ticket: {
          reporte_cierre: dto.ultimo_reporte_cierre || null,
          motivo_reapertura: dto.motivo_reapertura,
        },
        detalles_cita_insitu: ultimaCita
          ? {
              id_cita: ultimaCita.id_cita,
              fecha_programada: ultimaCita.fecha_programada,
              estado_cita: ultimaCita.estado_cita,
              observaciones_previas: ultimaCita.observaciones,
            }
          : null,
      },
    });

    return await this.auditoriaRepository.save(auditoria);
  }
}
