import { CitaSoporte } from '@/citas/domain/entity/cita-soporte.entity';
import {
  CitaSoporteRepositoryPort,
  PaginatedCitasResult,
} from '@/citas/domain/port/cita-soporte.repository.port';
import { PrismaService } from '@/common/infrastructure/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { CitaSoporteMapper } from './mapper/cita-soporte.mapper';
import { citas_soporte_estado, Prisma } from '@prisma/client';
import { CitaSoporteFilterCriteria } from '@/citas/domain/criteria/cita-soporte-filter.criteria';
import { CitaSoporteDetalleCriteria } from '@/citas/domain/criteria/cita-soporte-detalle.criteria';

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

  async hasAppointment(idTicket: number): Promise<CitaSoporte | null> {
    const record = await this.prisma.citas_soporte.findFirst({
      where: { id_ticket: idTicket },
      orderBy: { created_at: 'desc' }, // Obtenemos la última cita relacionada si existe
    });

    if (!record) return null; // Si no hay cita, retornamos null

    return CitaSoporteMapper.toDomain(record); // Si hay cita, retornamos la entidad de dominio correspondiente
  }

  async findAllWithFilters(
    filters: CitaSoporteFilterCriteria,
  ): Promise<PaginatedCitasResult> {
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const limit = filters.limit && filters.limit > 0 ? filters.limit : 10;
    const skip = (page - 1) * limit;

    const where: Prisma.citas_soporteWhereInput = {};

    if (filters.id_sucursal !== undefined) {
      where.id_sucursal = Number(filters.id_sucursal);
    }

    if (filters.estado !== undefined) {
      where.estado = filters.estado as unknown as citas_soporte_estado;
    }

    if (filters.fecha_programada !== undefined) {
      const fecha = new Date(filters.fecha_programada);
      const inicioDia = new Date(
        Date.UTC(
          fecha.getUTCFullYear(),
          fecha.getUTCMonth(),
          fecha.getUTCDate(),
        ),
      );
      where.fecha_programada = inicioDia;
    }

    if (filters.id_cliente !== undefined) {
      where.sucursales = {
        id_cliente: Number(filters.id_cliente),
      };
    }

    if (filters.search && filters.search.trim().length > 0) {
      const term = filters.search.trim();
      const numericId = Number(term);
      const isNumeric = !Number.isNaN(numericId) && Number.isInteger(numericId);

      where.OR = [
        ...(isNumeric ? [{ id_cita: numericId }] : []),
        {
          usuarios: {
            OR: [
              { nombre: { contains: term } },
              { apellido: { contains: term } },
            ],
          },
        },
        {
          tickets: {
            equipos: {
              clientes: {
                nombre_principal: { contains: term },
              },
            },
          },
        },
      ];
    }

    const [records, total] = await Promise.all([
      this.prisma.citas_soporte.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ fecha_programada: 'desc' }, { hora_inicio: 'asc' }],
        include: {
          usuarios: {
            select: {
              id_usuario: true,
              nombre: true,
              apellido: true,
            },
          },
          sucursales: {
            select: {
              id_sucursal: true,
              nombre_sucursal: true,
              direccion: true,
            },
          },
          tickets: {
            select: {
              equipos: {
                select: {
                  clientes: {
                    select: {
                      id_cliente: true,
                      nombre_principal: true,
                      numero_documento: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
      this.prisma.citas_soporte.count({ where }),
    ]);

    return {
      data: records.map((record) => CitaSoporteMapper.toCriteriaItem(record)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findDetailById(
    idCita: number,
  ): Promise<CitaSoporteDetalleCriteria | null> {
    const record = await this.prisma.citas_soporte.findUnique({
      where: { id_cita: Number(idCita) },
      include: {
        usuarios: {
          select: {
            id_usuario: true,
            nombre: true,
            apellido: true,
          },
        },
        sucursales: {
          select: {
            id_sucursal: true,
            nombre_sucursal: true,
            direccion: true,
            latitud: true,
            longitud: true,
          },
        },
        tickets: {
          include: {
            usuarios_tickets_id_trabajadorTousuarios: {
              select: {
                id_usuario: true,
                nombre: true,
                apellido: true,
              },
            },
            equipos: {
              include: {
                clientes: {
                  select: {
                    id_cliente: true,
                    nombre_principal: true,
                    numero_documento: true,
                  },
                },
                area: {
                  select: {
                    id_area: true,
                    nombre_area: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!record) return null;

    return CitaSoporteMapper.toDetailCriteria(record);
  }
}
