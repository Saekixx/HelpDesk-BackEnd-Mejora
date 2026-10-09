import { Inject, Injectable } from '@nestjs/common';
import {
  ZONA_REPOSITORY,
  ZonaRepositoryPort,
} from '../domain/ports/zona.repository.port';
import { Zona } from '../domain/entities/zona.entity';
import { UpdateZonaRequest } from './dtos/update-zona.requets';

@Injectable()
export class UpdateZonaUseCase {
  constructor(
    @Inject(ZONA_REPOSITORY)
    private readonly zonaRepository: ZonaRepositoryPort,
  ) {}

  async execute(id: number, zona: UpdateZonaRequest): Promise<Zona> {
    // Buscar la zona existente por su id
    const existingZona = await this.zonaRepository.findById(id);
    // Si no se encuentra la zona, lanzar un error
    if (!existingZona) throw new Error(`Zona con id ${id} no encontrada`);

    // Actualizar los campos de la zona existente con los datos proporcionados
    const updatedZona = new Zona({
      ...existingZona,
      nombre_zona: zona.nombre_zona ?? existingZona.nombre_zona,
      descripcion: zona.descripcion ?? existingZona.descripcion,
      is_active: existingZona.is_active,
      updatedAt: new Date(),
    });

    // Guardar la zona actualizada en el repositorio
    const savedZona = await this.zonaRepository.save(updatedZona);

    // Retornar la zona actualizada
    return savedZona;
  }
}
