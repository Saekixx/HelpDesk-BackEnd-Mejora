import { Auditoria } from '@/auditoria/domain/entity/auditoria.entity';
import {
  auditoria_eventos as PrismaAuditoriaModel,
  Prisma,
} from '@prisma/client';

export class AuditoriaMapper {
  /**
   * Convierte un modelo de Prisma a una Entidad de Dominio
   */
  public static toDomain(raw: PrismaAuditoriaModel): Auditoria {
    return new Auditoria({
      id_auditoria: raw.id_auditoria,
      id_ticket: raw.id_ticket,
      id_cita: raw.id_cita,
      id_usuario: raw.id_usuario ?? 0,
      tipo_evento: raw.tipo_evento,
      payload: (raw.payload as Record<string, any>) || {},
      createdAt: raw.created_at ?? new Date(),
    });
  }

  /**
   * Convierte una Entidad de Dominio al formato de persistencia de Prisma
   */
  public static toPersistence(auditoria: Auditoria): Omit<
    PrismaAuditoriaModel,
    'id_auditoria' | 'created_at' | 'payload'
  > & {
    payload: Prisma.InputJsonValue;
  } {
    return {
      id_ticket: auditoria.id_ticket ?? null,
      id_cita: auditoria.id_cita ?? null,
      id_usuario: auditoria.id_usuario ?? null,
      tipo_evento: auditoria.tipo_evento,
      // Forzamos el tipado como InputJsonValue admitido por Prisma para evitar conflictos de tipos
      payload: (auditoria.payload as Prisma.InputJsonValue) ?? {},
    };
  }
}
