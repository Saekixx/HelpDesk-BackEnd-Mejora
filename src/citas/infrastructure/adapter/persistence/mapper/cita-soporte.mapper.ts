import {
  CitaSoporte,
  CitaEstado,
} from '../../../../domain/entity/cita-soporte.entity';
import {
  citas_soporte as PrismaCitaModel,
  citas_soporte_estado,
} from '@prisma/client';

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
}
