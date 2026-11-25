import { CitaSoporteDetalleCriteria } from '../criteria/cita-soporte-detalle.criteria';
import { CitaSoporteFilterCriteria } from '../criteria/cita-soporte-filter.criteria';
import { CitaSoporteCriteria } from '../criteria/cita-soporte.criteria';
import { CitaSoporte } from '../entity/cita-soporte.entity';

export interface PaginatedCitasResult {
  data: CitaSoporteCriteria[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const CITA_SOPORTE_REPOSITORY = 'CITA_SOPORTE_REPOSITORY';

export interface CitaSoporteRepositoryPort {
  save(cita: CitaSoporte): Promise<CitaSoporte>;

  findAllWithFilters(
    filters: CitaSoporteFilterCriteria,
  ): Promise<PaginatedCitasResult>;

  findDetailById(idCita: number): Promise<CitaSoporteDetalleCriteria | null>;

  findById(idCita: number): Promise<CitaSoporte | null>;

  findByTicketId(idTicket: number): Promise<CitaSoporte[]>;

  findByTecnicoAndFecha(
    id_tecnico: number,
    fecha: Date,
  ): Promise<CitaSoporte[]>;

  // Método para verificar si un ticket tiene una cita vinculada
  hasAppointment(idTicket: number): Promise<CitaSoporte | null>;
}
