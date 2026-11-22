import { Auditoria } from '@/auditoria/domain/entity/auditoria.entity';

export const AUDITORIA_REPOSITORY = 'AUDITORIA_REPOSITORY';

export interface AuditoriaRepositoryPort {
  /**
   * Guarda un nuevo evento de auditoría de forma inmutable
   */
  save(auditoria: Auditoria): Promise<Auditoria>;

  /**
   * Busca los eventos de auditoría asociados a un ticket específico
   */
  findByTicketId(idTicket: number): Promise<Auditoria[]>;

  /**
   * Busca los eventos de auditoría asociados a una cita específica
   */
  findByCitaId(idCita: number): Promise<Auditoria[]>;
}
