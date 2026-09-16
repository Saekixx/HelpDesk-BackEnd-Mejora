import {
  tickets as PrismaTicket,
  tickets_estado as PrismaEstadoTicket,
} from '@prisma/client';
import { Ticket, EstadoTicket } from '@/tickets/domain/entities/ticket.entity';
import { TicketResponseCriteria } from '@/tickets/domain/criteria/ticket-response.criteria';

export type PrismaTicketWithRelations = PrismaTicket & {
  usuarios_tickets_id_trabajadorTousuarios?: {
    id_usuario: number;
    nombre: string;
    apellido: string;
  };
  equipos?: { id_equipo: number; tipo: string };
  clientes?: { id_cliente: number; nombre_principal: string };
  usuarios_tickets_id_soporteTousuarios?: {
    id_usuario: number;
    nombre: string;
    apellido: string;
  } | null;
};

export class TicketMapper {
  static toDomain(prismaTicket: PrismaTicket): Ticket {
    return new Ticket({
      id_tickets: prismaTicket.id_tickets,
      pin: prismaTicket.pin,
      asunto: prismaTicket.asunto,
      detalle: prismaTicket.detalle,
      estado: (prismaTicket.estado as unknown as EstadoTicket) ?? undefined,
      id_equipo: prismaTicket.id_equipo,
      id_cliente: prismaTicket.id_cliente,
      id_trabajador: prismaTicket.id_trabajador,
      id_soporte: prismaTicket.id_soporte ?? undefined,
      id_software: prismaTicket.id_software ?? undefined,
      es_software: prismaTicket.es_software ?? false,
      imagen_url: prismaTicket.imagen_url ?? undefined,
      createdAt: prismaTicket.created_at ?? undefined,
      updatedAt: prismaTicket.updated_at ?? undefined,
    });
  }

  static toPersistence(domain: Ticket): Partial<PrismaTicket> {
    return {
      ...(domain.id_tickets !== undefined && { id_tickets: domain.id_tickets }),
      pin: domain.pin,
      asunto: domain.asunto,
      detalle: domain.detalle,
      estado: domain.estado as unknown as PrismaEstadoTicket,
      id_equipo: domain.id_equipo,
      id_cliente: domain.id_cliente,
      id_trabajador: domain.id_trabajador,
      id_soporte: domain.id_soporte ?? null,
      id_software: domain.id_software ?? null,
      es_software: domain.es_software,
      imagen_url: domain.imagen_url ?? null,
      created_at: domain.createdAt,
      updated_at: domain.updatedAt,
    };
  }

  static toCriteriaResponse(raw: any): TicketResponseCriteria {
    const trabajador = raw.usuarios_tickets_id_trabajadorTousuarios;
    const soporte = raw.usuarios_tickets_id_soporteTousuarios;
    const equipo = raw.equipos;

    return {
      id_tickets: raw.id_tickets,
      pin: raw.pin,
      asunto: raw.asunto,
      fecha_creacion: raw.created_at,
      estado: raw.estado,
      usuario: {
        id: trabajador.id_usuario,
        nombre: `${trabajador.nombre} ${trabajador.apellido}`.trim(),
      },
      equipo: {
        id: equipo.id_equipo,
        tipo_equipo: equipo.tipo,
      },
      cliente: {
        id: raw.clientes.id_cliente,
        nombre: raw.clientes.nombre_principal,
      },
      sucursal: equipo?.sucursales
        ? {
            id: equipo.sucursales.id_sucursal,
            nombre: equipo.sucursales.nombre_sucursal,
          }
        : null,
      area: equipo?.area
        ? {
            id: equipo.area.id_area,
            nombre: equipo.area.nombre_area,
          }
        : null,
      soporte: soporte
        ? {
            id: soporte.id_usuario,
            nombre: `${soporte.nombre} ${soporte.apellido}`.trim(),
          }
        : null,
    };
  }
}
