import { Injectable } from '@nestjs/common';
import {
  TicketRepositoryPort,
  PaginatedTicketsResult,
} from '@/tickets/domain/ports/ticket.repository.port';
import { Ticket } from '@/tickets/domain/entities/ticket.entity';
import { TicketFilterCriteria } from '@/tickets/domain/criteria/ticket-filter.criteria';
import { Prisma, tickets_estado } from '@prisma/client';
import { PrismaService } from '@/common/infrastructure/prisma/prisma.service';
import { TicketMapper } from './mappers/ticket.mapper';

@Injectable()
export class TicketPrismaRepository implements TicketRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async save(ticket: Ticket): Promise<Ticket> {
    const data = TicketMapper.toPersistence(ticket);

    if (ticket.id_tickets) {
      const updated = await this.prisma.tickets.update({
        where: { id_tickets: ticket.id_tickets },
        data,
      });
      return TicketMapper.toDomain(updated);
    }

    const created = await this.prisma.tickets.create({
      data: data as Prisma.ticketsCreateInput,
    });
    return TicketMapper.toDomain(created);
  }

  async findById(id: number): Promise<Ticket | null> {
    const raw = await this.prisma.tickets.findUnique({
      where: { id_tickets: id },
    });
    return raw ? TicketMapper.toDomain(raw) : null;
  }

  async findByPin(pin: string): Promise<Ticket | null> {
    const raw = await this.prisma.tickets.findUnique({
      where: { pin },
    });
    return raw ? TicketMapper.toDomain(raw) : null;
  }

  // Mapeador de ayuda para tolerar textos con espacio como "En Progreso"
  private parseEstadoEnum(estado: string): tickets_estado | undefined {
    if (!estado) return undefined;

    // Normaliza "En Progreso" a "En_Progreso" para coincidir con la clave del Enum
    const normalizedKey = estado.replace(/\s+/g, '_');

    return tickets_estado[normalizedKey as keyof typeof tickets_estado];
  }

  // src/tickets/infrastructure/adapter/persistence/ticket-prisma.repository.ts

  async findAllWhitFilters(
    filters: TicketFilterCriteria,
  ): Promise<PaginatedTicketsResult> {
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 10;

    const { search, estado, id_cliente, id_sucursal, id_area } = filters;
    const skip = (page - 1) * limit;

    const parsedEstado = estado ? this.parseEstadoEnum(estado) : undefined;

    const where: Prisma.ticketsWhereInput = {
      ...(parsedEstado && { estado: parsedEstado }),
      ...(search && {
        OR: [
          { pin: { contains: search } },
          { asunto: { contains: search } },
          { detalle: { contains: search } },
        ],
      }),
      // Filtrar cliente, sucursal y área a través de la relación equipos
      ...((id_cliente || id_sucursal || id_area) && {
        equipos: {
          ...(id_cliente && { id_cliente: Number(id_cliente) }),
          ...(id_sucursal && { id_sucursal: Number(id_sucursal) }),
          ...(id_area && { id_area: Number(id_area) }),
        },
      }),
    };

    const [rawTickets, total] = await Promise.all([
      this.prisma.tickets.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          usuarios_tickets_id_trabajadorTousuarios: {
            select: { id_usuario: true, nombre: true, apellido: true },
          },
          equipos: {
            select: {
              id_equipo: true,
              tipo: true,
              clientes: {
                select: { id_cliente: true, nombre_principal: true },
              },
              sucursales: {
                select: { id_sucursal: true, nombre_sucursal: true },
              },
              area: { select: { id_area: true, nombre_area: true } },
            },
          },
          usuarios_tickets_id_soporteTousuarios: {
            select: { id_usuario: true, nombre: true, apellido: true },
          },
        },
      }),
      this.prisma.tickets.count({ where }),
    ]);

    const data = rawTickets.map((raw) => TicketMapper.toCriteriaResponse(raw));

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
