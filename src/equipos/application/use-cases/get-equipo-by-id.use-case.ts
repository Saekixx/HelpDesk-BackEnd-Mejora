import { Inject, Injectable } from '@nestjs/common';
import {
  EQUIPO_REPOSITORY,
  EquipoRepositoryPort,
} from '@/equipos/domain/ports/equipo.repository.port';
import { Equipo } from '@/equipos/domain/entities/equipo.entity';
import { EquipoNotFoundException } from '@/equipos/domain/exceptions/equipo.exceptions';

@Injectable()
export class GetEquipoByIdUseCase {
  constructor(
    @Inject(EQUIPO_REPOSITORY)
    private readonly equipoRepository: EquipoRepositoryPort,
  ) {}

  async execute(id: number): Promise<Equipo> {
    const equipo = await this.equipoRepository.findById(id);
    if (!equipo) throw new EquipoNotFoundException();
    return equipo;
  }
}