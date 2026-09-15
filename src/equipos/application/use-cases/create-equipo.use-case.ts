import { Inject, Injectable } from '@nestjs/common';
import {
  EQUIPO_REPOSITORY,
  EquipoRepositoryPort,
} from '@/equipos/domain/ports/equipo.repository.port';
import { Equipo } from '@/equipos/domain/entities/equipo.entity';
import { CreateEquipoDto } from '@/equipos/domain/dto/create-equipo.dto';
import { EquipoAlreadyExistsException } from '@/equipos/domain/exceptions/equipo.exceptions';

@Injectable()
export class CreateEquipoUseCase {
  constructor(
    @Inject(EQUIPO_REPOSITORY)
    private readonly equipoRepository: EquipoRepositoryPort,
  ) {}

  async execute(dto: CreateEquipoDto): Promise<Equipo> {
    if (dto.num_serie) {
      const numSerieEnUso = await this.equipoRepository.existsByNumSerie(
        dto.num_serie,
      );
      if (numSerieEnUso) throw new EquipoAlreadyExistsException();
    }

    return await this.equipoRepository.create({
      ...dto,
      is_active: dto.is_active ?? true,
    });
  }
}