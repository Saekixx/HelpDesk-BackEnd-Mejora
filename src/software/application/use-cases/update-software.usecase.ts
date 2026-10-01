import { Software } from '@/software/domain/entities/software.entity';
import {
  SOFTWARE_REPOSITORY,
  SoftwareRepositoryPort,
} from '@/software/domain/ports/software.repository.port';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateSoftwareDto } from '../dtos/update-software.dto';

@Injectable()
export class UpdateSoftwareUseCase {
  constructor(
    @Inject(SOFTWARE_REPOSITORY)
    private readonly softwareRepository: SoftwareRepositoryPort,
  ) {}

  async execute(id: number, softwareData: UpdateSoftwareDto): Promise<void> {
    // Validar si el software existe usando excepciones HTTP de NestJS
    const existingSoftware = await this.softwareRepository.findById(id);
    if (!existingSoftware) {
      throw new NotFoundException(`El software con ID ${id} no existe`);
    }

    // Fusionar valores anteriores con los nuevos para soportar actualización parcial
    const updatedSoftware = new Software({
      id_software: existingSoftware.id_software,
      nombre_software: softwareData.nombre_software ?? existingSoftware.nombre_software,
      licencia: softwareData.licencia ?? existingSoftware.licencia,
      correo: softwareData.correo ?? existingSoftware.correo,
      password: softwareData.password ?? existingSoftware.password,
      fecha_instalacion: softwareData.fecha_instalacion
        ? new Date(softwareData.fecha_instalacion)
        : existingSoftware.fecha_instalacion,
      fecha_caducidad: softwareData.fecha_caducidad
        ? new Date(softwareData.fecha_caducidad)
        : existingSoftware.fecha_caducidad,
      proveedor: softwareData.proveedor ?? existingSoftware.proveedor,
      is_active: softwareData.is_active ?? existingSoftware.is_active,
      createdAt: existingSoftware.createdAt,
      updatedAt: new Date(), // Actualizar la fecha de actualización
    });

    // Guardar el software actualizado en el repositorio
    await this.softwareRepository.save(updatedSoftware);
  }
}