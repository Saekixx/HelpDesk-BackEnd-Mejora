import { Hardware } from '@/hardware/domain/entities/hardware.entity';
import {
  HARDWARE_REPOSITORY,
  HardwareRepositoryPort,
} from '@/hardware/domain/ports/hardware.repository.port';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class ToggleHardwareStatusUseCase {
  constructor(
    @Inject(HARDWARE_REPOSITORY)
    private readonly hardwareRepository: HardwareRepositoryPort,
  ) {}

  async execute(id: number): Promise<string> {
    // Validar si el hardware existe usando excepciones HTTP de NestJS
    const existingHardware = await this.hardwareRepository.findById(id);
    if (!existingHardware) {
      throw new NotFoundException(`El hardware con ID ${id} no existe`);
    }

    // Cambiar el estado del hardware
    const updatedHardware = new Hardware({
      id_hardware: existingHardware.id_hardware,
      tipo_equipo: existingHardware.tipo_equipo,
      numero_serie: existingHardware.numero_serie,
      fecha_compra: existingHardware.fecha_compra,
      marca: existingHardware.marca,
      proveedor: existingHardware.proveedor,
      url_factura: existingHardware.url_factura,
      descripcion: existingHardware.descripcion,
      ult_revision: existingHardware.ult_revision,
      rev_programada: existingHardware.rev_programada,
      is_active: !existingHardware.is_active, // Cambiar el estado
      created_at: existingHardware.created_at,
      updated_at: new Date(), // Actualizar la fecha de actualización
    });

    // Guardar el hardware actualizado en el repositorio
    await this.hardwareRepository.save(updatedHardware);

    // Devolver un mensaje indicando el nuevo estado del hardware
    return `El hardware con ID ${id} ahora está ${
      updatedHardware.is_active ? 'activo' : 'inactivo'
    }`;
  }
}