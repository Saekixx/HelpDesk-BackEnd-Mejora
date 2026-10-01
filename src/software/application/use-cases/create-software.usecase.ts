import {
  SOFTWARE_REPOSITORY,
  SoftwareRepositoryPort,
} from '@/software/domain/ports/software.repository.port';
import { Inject, Injectable } from '@nestjs/common';
import { CreateSoftwareDto } from '../dtos/create-software.dto';
import { Software } from '@/software/domain/entities/software.entity';

@Injectable()
export class CreateSoftwareUseCase {
  constructor(
    @Inject(SOFTWARE_REPOSITORY)
    private readonly softwareRepository: SoftwareRepositoryPort,
  ) {}

  async execute(softwareData: CreateSoftwareDto): Promise<void> {
    // Mapear los datos del DTO a la entidad Software
    const newSoftware = new Software({
      nombre_software: softwareData.nombre_software,
      licencia: softwareData.licencia,
      correo: softwareData.correo,
      password: softwareData.password,
      fecha_instalacion: new Date(softwareData.fecha_instalacion),
      fecha_caducidad: new Date(softwareData.fecha_caducidad),
      proveedor: softwareData.proveedor,
      is_active: softwareData.is_active ?? true,
    });

    // Guardar el nuevo software en el repositorio
    await this.softwareRepository.save(newSoftware);
  }
}