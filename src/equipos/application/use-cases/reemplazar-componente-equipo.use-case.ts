import { Inject, Injectable } from '@nestjs/common';
import {
  EQUIPO_REPOSITORY,
  EquipoRepositoryPort,
} from '@/equipos/domain/ports/equipo.repository.port';
import { ComponenteHardware } from '@/equipos/domain/entities/equipo.entity';
import { ReemplazarComponenteDto } from '@/equipos/domain/dto/reemplazar-componente.dto';

@Injectable()
export class ReemplazarComponenteEquipoUseCase {
  constructor(
    @Inject(EQUIPO_REPOSITORY)
    private readonly equipoRepository: EquipoRepositoryPort,
  ) {}

  async execute(
    id_equipo: number,
    dto: ReemplazarComponenteDto,
  ): Promise<ComponenteHardware> {
    // El adaptador de persistencia ejecuta el reemplazo en una transacción y
    // lanza excepciones de dominio 404 si el equipo, el hardware nuevo o el
    // componente saliente no existen.
    return await this.equipoRepository.reemplazarComponente(id_equipo, dto);
  }
}