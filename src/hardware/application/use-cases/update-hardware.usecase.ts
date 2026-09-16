import {
  HARDWARE_REPOSITORY,
  HardwareRepositoryPort,
} from '@/hardware/domain/ports/hardware.repository.port';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Hardware } from '@/hardware/domain/entities/hardware.entity';
import { UpdateHardwareDto } from '../dtos/update-hardware.dto';

@Injectable()
export class UpdateHardwareUseCase {
  constructor(
    @Inject(HARDWARE_REPOSITORY)
    private readonly hardwareRepository: HardwareRepositoryPort,
  ) {}

  async execute(id: number, hardwareData: UpdateHardwareDto): Promise<void> {
    // Validar si el hardware existe usando excepciones HTTP de NestJS
    const existingHardware = await this.hardwareRepository.findById(id);
    if (!existingHardware) {
      throw new NotFoundException(`El hardware con ID ${id} no existe`);
    }

    // Fusionar valores anteriores con los nuevos para soportar actualización parcial
    const updatedHardware = new Hardware({
      id_hardware: existingHardware.id_hardware,
      tipo_equipo: hardwareData.tipo_equipo ?? existingHardware.tipo_equipo,
      numero_serie: hardwareData.numero_serie ?? existingHardware.numero_serie,
      fecha_compra: hardwareData.fecha_compra
        ? new Date(hardwareData.fecha_compra)
        : existingHardware.fecha_compra,
      marca: hardwareData.marca ?? existingHardware.marca,
      proveedor: hardwareData.proveedor ?? existingHardware.proveedor,
      descripcion: hardwareData.descripcion ?? existingHardware.descripcion,
      ult_revision: existingHardware.ult_revision,
      rev_programada: existingHardware.rev_programada,
      is_active: existingHardware.is_active,
      created_at: existingHardware.created_at,
      updated_at: new Date(), // Actualizar la fecha de actualización
    });

    // Guardar el hardware actualizado en el repositorio
    await this.hardwareRepository.save(updatedHardware);
  }
}