import {
  tickets as PrismaTicket,
  tickets_estado as PrismaEstadoTicket,
  Prisma,
} from '@prisma/client';
import { Ticket, EstadoTicket } from '@/tickets/domain/entities/ticket.entity';
import { TicketResponseCriteria } from '@/tickets/domain/criteria/ticket-response.criteria';
import { TicketDetalleCriteria } from '@/tickets/domain/criteria/ticket-detalle.criteria';

export class TicketMapper {
  static toDomain(prismaTicket: PrismaTicket): Ticket {
    return new Ticket({
      id_tickets: prismaTicket.id_tickets,
      pin: prismaTicket.pin,
      asunto: prismaTicket.asunto,
      detalle: prismaTicket.detalle,
      reporte_cierre: prismaTicket.reporte_cierre ?? undefined,
      estado: (prismaTicket.estado as unknown as EstadoTicket) ?? undefined,
      id_equipo: prismaTicket.id_equipo,
      id_trabajador: prismaTicket.id_trabajador,
      id_soporte: prismaTicket.id_soporte ?? undefined,
      es_software: prismaTicket.es_software ?? false,
      createdAt: prismaTicket.created_at ?? undefined,
      updatedAt: prismaTicket.updated_at ?? undefined,
    });
  }

  static toPersistence(domain: Ticket): Prisma.ticketsUncheckedCreateInput {
    return {
      ...(domain.id_tickets !== undefined && {
        id_tickets: Number(domain.id_tickets),
      }),
      pin: domain.pin,
      asunto: domain.asunto,
      detalle: domain.detalle,
      reporte_cierre: domain.reporte_cierre ?? null,
      estado: domain.estado as unknown as PrismaEstadoTicket,
      id_equipo: Number(domain.id_equipo),
      id_trabajador: Number(domain.id_trabajador),
      id_soporte: domain.id_soporte ? Number(domain.id_soporte) : null,
      es_software: domain.es_software,
      created_at: domain.createdAt,
      updated_at: domain.updatedAt,
    };
  }

  static toDetailResponse(raw: any): TicketDetalleCriteria {
    const trabajador = raw.usuarios_tickets_id_trabajadorTousuarios;
    const equipo = raw.equipos;
    const soporte = raw.usuarios_tickets_id_soporteTousuarios;

    const cliente = equipo?.clientes;
    const sucursal = equipo?.sucursales;
    const area = equipo?.area;

    return {
      id_ticket: raw.id_tickets,
      pin: raw.pin,
      asunto: raw.asunto,
      detalle: raw.detalle,
      es_software: raw.es_software ?? false,
      createdAt: raw.created_at,
      updatedAt: raw.updated_at,
      estado: raw.estado,

      trabajador: trabajador
        ? {
            id_trabajador: trabajador.id_usuario,
            nombre: trabajador.nombre,
            apellido: trabajador.apellido,
            telefono: trabajador.telefono ?? '',
            correo: trabajador.correo ?? '',
            id_cliente: cliente?.id_cliente ?? 0,
            nombre_cliente: cliente?.nombre_principal ?? '',
            id_sucursal: sucursal?.id_sucursal ?? 0,
            nombre_sucursal: sucursal?.nombre_sucursal ?? '',
            id_area: area?.id_area ?? 0,
            nombre_area: area?.nombre_area ?? '',
          }
        : null,

      equipo: equipo
        ? {
            id_equipo: equipo.id_equipo,
            nombre_equipo: equipo.nombre_equipo ?? '',
            tipo: equipo.tipo,
            numero_serie: equipo.num_serie ?? '',
            marca_modelo: equipo.marca_modelo ?? '',
          }
        : null,

      soporte: soporte
        ? {
            id_soporte: soporte.id_usuario,
            nombre: soporte.nombre,
            apellido: soporte.apellido,
            telefono: soporte.telefono ?? '',
            correo: soporte.correo ?? '',
            area: soporte.area?.nombre_area ?? 'Soporte Técnico',
            rol: soporte.rol ?? 'SOPORTE_TECNICO',
          }
        : null,
    };
  }

  static toCriteriaResponse(raw: any): TicketResponseCriteria {
    const equipo = raw.equipos;
    const cliente = equipo?.clientes;
    const sucursal = equipo?.sucursales;
    const area = equipo?.area;
    const soporte = raw.usuarios_tickets_id_soporteTousuarios;

    return {
      id_ticket: raw.id_tickets,
      pin: raw.pin,
      asunto: raw.asunto,
      detalle: raw.detalle,
      es_software: raw.es_software,
      estado: raw.estado,

      equipo: equipo
        ? {
            id_equipo: equipo.id_equipo,
            nombre: equipo.nombre_equipo,
            marca_modelo: equipo.marca_modelo,
            tipo: equipo.tipo,
            numero_serie: equipo.num_serie,
          }
        : null,

      cliente: cliente
        ? {
            id_cliente: cliente.id_cliente,
            nombre: cliente.nombre_principal,
          }
        : null,

      sucursal: sucursal
        ? {
            id_sucursal: sucursal.id_sucursal,
            nombre: sucursal.nombre_sucursal,
          }
        : null,

      area: area
        ? {
            id_area: area.id_area,
            nombre: area.nombre_area,
          }
        : null,

      soporte: soporte
        ? {
            id_soporte: soporte.id_usuario,
            nombre: soporte.nombre,
            apellido: soporte.apellido,
          }
        : null,
    };
  }
}
