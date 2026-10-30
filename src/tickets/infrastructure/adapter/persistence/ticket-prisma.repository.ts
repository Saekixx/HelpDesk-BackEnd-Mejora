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
      data: data,
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

  async findAllWithFilters(
    filters: TicketFilterCriteria,
  ): Promise<PaginatedTicketsResult> {
    const page = Number(filters?.page) || 1;
    const limit = Number(filters?.limit) || 10;
    const skip = (page - 1) * limit;

    let estadoEnum: tickets_estado | undefined = undefined;
    const rawEstado = filters?.estado;

    if (
      rawEstado &&
      typeof rawEstado === 'string' &&
      rawEstado.trim() !== '' &&
      String(rawEstado).trim() !== '--'
    ) {
      const trimmed = rawEstado.trim().toLowerCase();
      switch (trimmed) {
        case 'pendiente':
          estadoEnum = tickets_estado.Pendiente;
          break;
        case 'asignado':
          estadoEnum = tickets_estado.Asignado;
          break;
        case 'en progreso':
        case 'en_progreso':
          estadoEnum = tickets_estado.En_Progreso;
          break;
        case 'derivado insitu':
        case 'derivado_insitu':
        case 'derivado in situ':
          estadoEnum = tickets_estado.Derivado_InSitu;
          break;
        case 'en espera repuesto':
        case 'en_espera_repuesto':
          estadoEnum = tickets_estado.En_Espera_Repuesto;
          break;
        case 'reabierto':
          estadoEnum = tickets_estado.Reabierto;
          break;
        case 'cerrado':
          estadoEnum = tickets_estado.Cerrado;
          break;
        default:
          estadoEnum = undefined;
          break;
      }
    }

    // 2. Resolvemos el search (ignorando valores vacíos o placeholders de Swagger)
    let searchCondition: any = undefined;
    if (
      filters?.search &&
      typeof filters.search === 'string' &&
      filters.search.trim() !== '' &&
      filters.search.toLowerCase() !== 'search'
    ) {
      const searchTerm = filters.search.trim();
      searchCondition = [
        { pin: { contains: searchTerm } },
        { asunto: { contains: searchTerm } },
        { detalle: { contains: searchTerm } },
      ];
    }

    // 3. Resolvemos los filtros numéricos de equipos
    const parseNum = (val: any): number | undefined => {
      if (
        val === undefined ||
        val === null ||
        val === '' ||
        isNaN(Number(val))
      ) {
        return undefined;
      }
      return Number(val);
    };

    const clienteId = parseNum(filters?.id_cliente);
    const sucursalId = parseNum(filters?.id_sucursal);
    const areaId = parseNum(filters?.id_area);

    let equiposCondition: any = undefined;
    if (
      clienteId !== undefined ||
      sucursalId !== undefined ||
      areaId !== undefined
    ) {
      equiposCondition = {
        ...(clienteId !== undefined && { id_cliente: clienteId }),
        ...(sucursalId !== undefined && { id_sucursal: sucursalId }),
        ...(areaId !== undefined && { id_area: areaId }),
      };
    }

    // 4. Construcción declarativa del where:
    // Si la variable es undefined, la propiedad NO se incluye en el objeto.
    const where: Prisma.ticketsWhereInput = {
      ...(estadoEnum !== undefined && { estado: estadoEnum }),
      ...(searchCondition && { OR: searchCondition }),
      ...(equiposCondition && { equipos: equiposCondition }),
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
              nombre_equipo: true,
              tipo: true,
              marca_modelo: true,
              num_serie: true,
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
