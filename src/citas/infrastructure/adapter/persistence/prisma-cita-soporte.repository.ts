import { CitaSoporte } from '@/citas/domain/entity/cita-soporte.entity';
import { CitaSoporteRepositoryPort } from '@/citas/domain/port/cita-soporte.repository.port';
import { PrismaService } from '@/common/infrastructure/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { CitaSoporteMapper } from './mapper/cita-soporte.mapper';

@Injectable()
export class PrismaCitaSoporteRepository implements CitaSoporteRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async save(cita: CitaSoporte): Promise<CitaSoporte> {
    const data = CitaSoporteMapper.toPersistence(cita);

    let record;
    if (cita.id_cita) {
      // Actualizar si ya tiene ID
      record = await this.prisma.citas_soporte.update({
        where: { id_cita: cita.id_cita },
        data,
      });
    } else {
      // Crear si es nuevo
      record = await this.prisma.citas_soporte.create({
        data,
      });
    }

    return CitaSoporteMapper.toDomain(record);
  }

  async findById(idCita: number): Promise<CitaSoporte | null> {
    const record = await this.prisma.citas_soporte.findUnique({
      where: { id_cita: idCita },
    });

    if (!record) return null;
    return CitaSoporteMapper.toDomain(record);
  }

  async findByTicketId(idTicket: number): Promise<CitaSoporte[]> {
    const records = await this.prisma.citas_soporte.findMany({
      where: { id_ticket: idTicket },
      orderBy: { created_at: 'desc' },
    });

    return records.map((record) => CitaSoporteMapper.toDomain(record));
  }

  async findByTecnicoAndFecha(
    id_tecnico: number,
    fecha: Date,
  ): Promise<CitaSoporte[]> {
    // Buscamos las citas del técnico que coincidan con la fecha programada
    const records = await this.prisma.citas_soporte.findMany({
      where: {
        id_tecnico: Number(id_tecnico),
        fecha_programada: fecha,
      },
    });

    return records.map((record) => CitaSoporteMapper.toDomain(record));
  }
}
