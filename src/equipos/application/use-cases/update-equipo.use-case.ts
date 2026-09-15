import { Inject, Injectable } from '@nestjs/common';
import {
  EQUIPO_REPOSITORY,
  EquipoRepositoryPort,
} from '@/equipos/domain/ports/equipo.repository.port';
import { Equipo } from '@/equipos/domain/entities/equipo.entity';
import { UpdateEquipoDto } from '@/equipos/domain/dto/update-equipo.dto';
import {
  EquipoNotFoundException,
  EquipoAlreadyExistsException,
} from '@/equipos/domain/exceptions/equipo.exceptions';

@Injectable()
export class UpdateEquipoUseCase {
  constructor(
    @Inject(EQUIPO_REPOSITORY)
    private readonly equipoRepository: EquipoRepositoryPort,
  ) {}

  async execute(id: number, dto: UpdateEquipoDto): Promise<Equipo> {
    const existing = await this.equipoRepository.findById(id);
    if (!existing) throw new EquipoNotFoundException();

    // Si cambia el número de serie, validar que no esté en uso por otro equipo
    if (dto.num_serie && dto.num_serie !== existing.num_serie) {
      const numSerieEnUso = await this.equipoRepository.existsByNumSerie(
        dto.num_serie,
      );
      if (numSerieEnUso) throw new EquipoAlreadyExistsException();
    }

    return await this.equipoRepository.update(id, dto);
  }
}