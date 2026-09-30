import { Inject, Injectable } from '@nestjs/common';
import {
  EQUIPO_REPOSITORY,
  EquipoRepositoryPort,
} from '@/equipos/domain/ports/equipo.repository.port';
import { ComponenteHardware } from '@/equipos/domain/entities/equipo.entity';
import { AgregarComponenteDto } from '@/equipos/domain/dto/agregar-componente.dto';

@Injectable()
export class AgregarComponenteEquipoUseCase {
  constructor(
    @Inject(EQUIPO_REPOSITORY)
    private readonly equipoRepository: EquipoRepositoryPort,
  ) {}

  async execute(
    id_equipo: number,
    dto: AgregarComponenteDto,
  ): Promise<ComponenteHardware> {
    // El adaptador de persistencia valida que existan el equipo y el
    // componente de hardware, y lanza la excepción de dominio 404 si no.
    return await this.equipoRepository.agregarComponente(id_equipo, dto);
  }
}