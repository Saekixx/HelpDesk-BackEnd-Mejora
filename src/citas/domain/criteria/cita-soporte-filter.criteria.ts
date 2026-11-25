import { CitaEstado } from '../entity/cita-soporte.entity';

export class CitaSoporteFilterCriteria {
  search?: string; // Campo de búsqueda para filtrar por nombre del técnico, cliente o id de cita
  id_cliente?: number;
  id_sucursal?: number;
  estado?: CitaEstado;
  fecha_programada?: Date; // Fecha programda de la cita (no es la fecha de creacion)
  page?: number; // Número de página para la paginación\
  limit?: number; // Cantidad de registros por página para la paginación
}
