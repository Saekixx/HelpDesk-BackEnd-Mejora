import { CitaSoporteDetalleCriteria } from '@/citas/domain/criteria/cita-soporte-detalle.criteria';
import {
  CitaSoporte,
  CitaEstado,
} from '../../../../domain/entity/cita-soporte.entity';
import {
  Prisma,
  citas_soporte as PrismaCitaModel,
  citas_soporte_estado,
} from '@prisma/client';
import { CitaSoporteCriteria } from '@/citas/domain/criteria/cita-soporte.criteria';

export type PrismaCitaConResumen = Prisma.citas_soporteGetPayload<{
  include: {
    usuarios: {
      select: {
        id_usuario: true;
        nombre: true;
        apellido: true;
      };
    };
    sucursales: {
      select: {
        id_sucursal: true;
        nombre_sucursal: true;
        direccion: true;
      };
    };
    tickets: {
      select: {
        equipos: {
          select: {
            clientes: {
              select: {
                id_cliente: true;
                nombre_principal: true;
                numero_documento: true;
              };
            };
          };
        };
      };
    };
  };
}>;

export type PrismaCitaConDetalle = Prisma.citas_soporteGetPayload<{
  include: {
    usuarios: {
      select: {
        id_usuario: true;
        nombre: true;
        apellido: true;
      };
    };
    sucursales: {
      select: {
        id_sucursal: true;
        nombre_sucursal: true;
        direccion: true;
        latitud: true;
        longitud: true;
      };
    };
    tickets: {
      include: {
        usuarios_tickets_id_trabajadorTousuarios: {
          select: {
            id_usuario: true;
            nombre: true;
            apellido: true;
          };
        };
        equipos: {
          include: {
            clientes: {
              select: {
                id_cliente: true;
                nombre_principal: true;
                numero_documento: true;
              };
            };
            area: {
              select: {
                id_area: true;
                nombre_area: true;
              };
            };
          };
        };
      };
    };
  };
}>;

export class CitaSoporteMapper {
  /**
   * Convierte un modelo de Prisma a una Entidad de Dominio
   */
  public static toDomain(raw: PrismaCitaModel): CitaSoporte {
    return new CitaSoporte({
      id_cita: raw.id_cita,
      id_ticket: raw.id_ticket,
      id_tecnico: raw.id_tecnico,
      id_sucursal: raw.id_sucursal,
      fecha_programada: raw.fecha_programada,
      hora_inicio: raw.hora_inicio,
      hora_fin: raw.hora_fin,
      estado: (raw.estado as CitaEstado) ?? 'Pendiente',
      observaciones: raw.observaciones,
      createdAt: raw.created_at ?? new Date(),
      updatedAt: raw.updated_at ?? new Date(),
    });
  }

  /**
   * Prepara los datos para persistir en Prisma (Crear o Actualizar)
   */
  public static toPersistence(cita: CitaSoporte) {
    return {
      id_ticket: cita.id_ticket,
      id_tecnico: cita.id_tecnico,
      id_sucursal: cita.id_sucursal,
      fecha_programada: cita.fecha_programada,
      hora_inicio: cita.hora_inicio,
      hora_fin: cita.hora_fin ? cita.hora_fin : null,
      estado: cita.estado as unknown as citas_soporte_estado,
      observaciones: cita.observaciones,
    };
  }

  /**
   * Mapea al criterio de listado paginado (CitaSoporteCriteria)
   */
  public static toCriteriaItem(raw: PrismaCitaConResumen): CitaSoporteCriteria {
    return {
      id_cita: raw.id_cita,
      estado: (raw.estado as CitaEstado) ?? 'Pendiente',
      fecha_programada: raw.fecha_programada,
      hora_inicio: raw.hora_inicio,
      hora_fin: raw.hora_fin!,
      observaciones: raw.observaciones,
      tecnico: {
        id_tecnico: raw.usuarios.id_usuario,
        nombre: raw.usuarios.nombre,
        apellido: raw.usuarios.apellido,
      },
      cliente: {
        id_cliente: raw.tickets.equipos.clientes?.id_cliente ?? 0,
        nombre_principal: raw.tickets.equipos.clientes?.nombre_principal ?? '',
        numero_documento: raw.tickets.equipos.clientes?.numero_documento ?? '',
      },
      sucursal: {
        id_sucursal: raw.sucursales.id_sucursal,
        nombre_sucursal: raw.sucursales.nombre_sucursal,
        direccion: raw.sucursales.direccion,
      },
    };
  }

  /**
   * Mapea al criterio de detalle completo (CitaSoporteDetalleCriteria)
   */
  public static toDetailCriteria(
    raw: PrismaCitaConDetalle,
  ): CitaSoporteDetalleCriteria {
    const equipo = raw.tickets.equipos;
    const cliente = equipo.clientes;
    const area = equipo.area;
    const trabajador = raw.tickets.usuarios_tickets_id_trabajadorTousuarios;

    return {
      id_cita: raw.id_cita,
      estado: (raw.estado as CitaEstado) ?? 'Pendiente',
      fecha_programada: raw.fecha_programada,
      hora_inicio: raw.hora_inicio,
      hora_fin: raw.hora_fin!,
      observaciones: raw.observaciones,
      tecnico: {
        id_tecnico: raw.usuarios.id_usuario,
        nombre: raw.usuarios.nombre,
        apellido: raw.usuarios.apellido,
      },
      cliente: {
        id_cliente: cliente?.id_cliente ?? 0,
        nombre_principal: cliente?.nombre_principal ?? '',
        numero_documento: cliente?.numero_documento ?? '',
      },
      sucursal: {
        id_sucursal: raw.sucursales.id_sucursal,
        nombre_sucursal: raw.sucursales.nombre_sucursal,
        direccion: raw.sucursales.direccion,
        latidud:
          raw.sucursales.latitud !== null
            ? Number(raw.sucursales.latitud)
            : null,
        longitud:
          raw.sucursales.longitud !== null
            ? Number(raw.sucursales.longitud)
            : null,
      },
      area: {
        id_area: area?.id_area ?? 0,
        nombre_area: area?.nombre_area ?? '',
      },
      trabajador: {
        id_trabajador: trabajador.id_usuario,
        nombre: trabajador.nombre,
        apellido: trabajador.apellido,
      },
      equipo: {
        id_equipo: equipo.id_equipo,
        tipo: equipo.tipo,
        ultima_revision: equipo.ult_revision,
      },
    };
  }
}
