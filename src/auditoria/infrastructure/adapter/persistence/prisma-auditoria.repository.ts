import { Auditoria } from '@/auditoria/domain/entity/auditoria.entity';
import { AuditoriaRepositoryPort } from '@/auditoria/domain/port/auditoria.repository.port';
import { PrismaService } from '@/common/infrastructure/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { AuditoriaMapper } from './mapper/auditoria.mapper';

@Injectable()
export class PrismaAuditoriaRepository implements AuditoriaRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Guarda un evento de auditoría: crea un nuevo registro si no tiene id_auditoria,
   * o lo actualiza si ya existe.
   */
  async save(auditoria: Auditoria): Promise<Auditoria> {
    const data = AuditoriaMapper.toPersistence(auditoria);

    if (auditoria.id_auditoria) {
      const updatedRecord = await this.prisma.auditoria_eventos.update({
        where: { id_auditoria: auditoria.id_auditoria },
        data,
      });
      return AuditoriaMapper.toDomain(updatedRecord);
    }

    const createdRecord = await this.prisma.auditoria_eventos.create({
      data,
    });

    return AuditoriaMapper.toDomain(createdRecord);
  }

  /**
   * Busca los eventos de auditoría asociados a un ticket específico
   */
  async findByTicketId(idTicket: number): Promise<Auditoria[]> {
    const records = await this.prisma.auditoria_eventos.findMany({
      where: { id_ticket: idTicket },
      orderBy: { created_at: 'desc' },
    });

    return records.map((record) => AuditoriaMapper.toDomain(record));
  }

  /**
   * Busca los eventos de auditoría asociados a una cita específica
   */
  async findByCitaId(idCita: number): Promise<Auditoria[]> {
    const records = await this.prisma.auditoria_eventos.findMany({
      where: { id_cita: idCita },
      orderBy: { created_at: 'desc' },
    });

    return records.map((record) => AuditoriaMapper.toDomain(record));
  }
}
