// src/modules/auditoria/application/use-cases/register-close-audit.use-case.ts
import { Inject, Injectable } from '@nestjs/common';
import {
  AuditoriaRepositoryPort,
  AUDITORIA_REPOSITORY,
} from '@/auditoria/domain/port/auditoria.repository.port';
import { Auditoria } from '@/auditoria/domain/entity/auditoria.entity';
import { RegisterClosureAuditDto } from '../dtos/RegisterClosureAudit.dto';
import { AuditoriaContextResolver } from '../service/auditoria-context.resolver';

@Injectable()
export class RegisterCloseAuditUseCase {
  constructor(
    @Inject(AUDITORIA_REPOSITORY)
    private readonly auditoriaRepository: AuditoriaRepositoryPort,
    private readonly contextResolver: AuditoriaContextResolver,
  ) {}

  async execute(dto: RegisterClosureAuditDto): Promise<Auditoria> {
    // 1. Resuelve automáticamente si existió una cita vinculada al ticket
    const citaInsitu = await this.contextResolver.resolveUltimaCita(
      dto.id_ticket,
    );

    // 2. Construye la auditoría deduciendo tipo_intervencion y adjuntando el estado de la cita
    const auditoria = Auditoria.create({
      id_ticket: dto.id_ticket,
      id_cita: citaInsitu?.id_cita || null,
      id_usuario: dto.id_usuario,
      tipo_evento: 'TICKET_CERRADO',
      payload: {
        estado_anterior: dto.estado_anterior,
        estado_nuevo: dto.estado_nuevo,
        tipo_intervencion: citaInsitu ? 'INSITU' : 'REMOTO',
        detalles_ticket: {
          reporte_cierre: dto.reporte_cierre,
          motivo_cierre:
            dto.motivo_cierre || 'Solución registrada satisfactoriamente.',
        },
        detalles_cita_insitu: citaInsitu,
      },
    });

    return await this.auditoriaRepository.save(auditoria);
  }
}
