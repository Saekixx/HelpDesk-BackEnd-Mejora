import { Inject, Injectable } from '@nestjs/common';
import {
  ZONA_REPOSITORY,
  ZonaRepositoryPort,
} from '../domain/ports/zona.repository.port';
import { Zona } from '../domain/entities/zona.entity';

@Injectable()
export class ToggleZonaStatusUseCase {
  constructor(
    @Inject(ZONA_REPOSITORY)
    private readonly zonaRepository: ZonaRepositoryPort,
  ) {}

  async execute(id: number): Promise<String> {
    // Buscar la zona existente por su id
    const existingZona = await this.zonaRepository.findById(id);
    // Si no se encuentra la zona, lanzar un error
    if (!existingZona) throw new Error(`Zona con id ${id} no encontrada`);

    // Cambiar el estado de la zona (is_active) al valor opuesto
    const updatedZona = await this.zonaRepository.toggleStatus(id);
    // Retornar la zona actualizada
    return `Zona  ${updatedZona?.is_active ? 'activo' : 'inactivo'} correctamente`;
  }
}
