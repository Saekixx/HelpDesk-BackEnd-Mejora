import { CitaSoporte } from '../entity/cita-soporte.entity';

export const CITA_SOPORTE_REPOSITORY = 'CITA_SOPORTE_REPOSITORY';

export interface CitaSoporteRepositoryPort {
  save(cita: CitaSoporte): Promise<CitaSoporte>;

  findById(idCita: number): Promise<CitaSoporte | null>;

  findByTicketId(idTicket: number): Promise<CitaSoporte[]>;

  findByTecnicoAndFecha(
    id_tecnico: number,
    fecha: Date,
  ): Promise<CitaSoporte[]>;
}
