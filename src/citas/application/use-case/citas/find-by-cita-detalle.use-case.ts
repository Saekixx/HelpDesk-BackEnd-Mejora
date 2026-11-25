import { CitaSoporteDetalleCriteria } from '@/citas/domain/criteria/cita-soporte-detalle.criteria';
import { CitaSoporteFilterCriteria } from '@/citas/domain/criteria/cita-soporte-filter.criteria';
import {
  CITA_SOPORTE_REPOSITORY,
  CitaSoporteRepositoryPort,
  PaginatedCitasResult,
} from '@/citas/domain/port/cita-soporte.repository.port';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindByCitaDetalleUseCase {
  constructor(
    @Inject(CITA_SOPORTE_REPOSITORY)
    private readonly citaRepository: CitaSoporteRepositoryPort,
  ) {}

  async execute(idCita: number): Promise<CitaSoporteDetalleCriteria | string> {
    const citaDetalle = await this.citaRepository.findDetailById(idCita);

    if (!citaDetalle) {
      return 'Cita no encontrada'; // Retorna un mensaje si no se encuentra la cita
    }

    return citaDetalle;
  }
}
