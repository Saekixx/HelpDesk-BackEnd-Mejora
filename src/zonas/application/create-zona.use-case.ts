import { Inject, Injectable } from '@nestjs/common';
import {
  ZONA_REPOSITORY,
  ZonaRepositoryPort,
} from '../domain/ports/zona.repository.port';
import { Zona } from '../domain/entities/zona.entity';
import { CreateZonaRequest } from './dtos/create-zona.request';

@Injectable()
export class CreateZonaUseCase {
  constructor(
    @Inject(ZONA_REPOSITORY)
    private readonly zonaRepository: ZonaRepositoryPort,
  ) {}

  async execute(zona: CreateZonaRequest): Promise<Zona> {
    // Crear una nueva instancia de Zona con los datos proporcionados
    const newZona = new Zona({
      nombre_zona: zona.nombre_zona ?? '',
      descripcion: zona.descripcion ?? '',
      is_active: true, // Por defecto, la nueva zona está activa
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Guardar la nueva zona en el repositorio
    const savedZona = await this.zonaRepository.save(newZona);

    // Retornar la zona guardada
    return savedZona;
  }
}
