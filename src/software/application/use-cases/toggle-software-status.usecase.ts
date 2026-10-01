import { Software } from '@/software/domain/entities/software.entity';
import {
  SOFTWARE_REPOSITORY,
  SoftwareRepositoryPort,
} from '@/software/domain/ports/software.repository.port';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class ToggleSoftwareStatusUseCase {
  constructor(
    @Inject(SOFTWARE_REPOSITORY)
    private readonly softwareRepository: SoftwareRepositoryPort,
  ) {}

  async execute(id: number): Promise<string> {
    // Validar si el software existe usando excepciones HTTP de NestJS
    const existingSoftware = await this.softwareRepository.findById(id);
    if (!existingSoftware) {
      throw new NotFoundException(`El software con ID ${id} no existe`);
    }

    // Cambiar el estado del software
    const updatedSoftware = new Software({
      id_software: existingSoftware.id_software,
      nombre_software: existingSoftware.nombre_software,
      licencia: existingSoftware.licencia,
      correo: existingSoftware.correo,
      password: existingSoftware.password,
      fecha_instalacion: existingSoftware.fecha_instalacion,
      fecha_caducidad: existingSoftware.fecha_caducidad,
      proveedor: existingSoftware.proveedor,
      is_active: !existingSoftware.is_active, // Cambiar el estado
      createdAt: existingSoftware.createdAt,
      updatedAt: new Date(), // Actualizar la fecha de actualización
    });

    // Guardar el software actualizado en el repositorio
    await this.softwareRepository.save(updatedSoftware);

    // Devolver un mensaje indicando el nuevo estado del software
    return `El software con ID ${id} ahora está ${
      updatedSoftware.is_active ? 'activo' : 'inactivo'
    }`;
  }
}