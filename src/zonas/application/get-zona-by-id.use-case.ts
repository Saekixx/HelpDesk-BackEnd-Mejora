import { Inject, Injectable } from '@nestjs/common';
import {
  ZONA_REPOSITORY,
  ZonaRepositoryPort,
} from '../domain/ports/zona.repository.port';
import { Zona } from '../domain/entities/zona.entity';

@Injectable()
export class GetZonaByIddUseCase {
  constructor(
    @Inject(ZONA_REPOSITORY)
    private readonly zonaRepository: ZonaRepositoryPort,
  ) {}

  async execute(id: number): Promise<Zona> {
    // Buscar la zona existente por su id
    const existingZona = await this.zonaRepository.findById(id);
    // Si no se encuentra la zona, lanzar un error
    if (!existingZona) throw new Error(`Zona con id ${id} no encontrada`);

    // Retornar la zona encontrada
    return existingZona;
  }
}
