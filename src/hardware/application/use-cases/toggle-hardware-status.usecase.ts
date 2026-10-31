import { Hardware } from '@/hardware/domain/entities/hardware.entity';
import {
  HARDWARE_REPOSITORY,
  HardwareRepositoryPort,
} from '@/hardware/domain/ports/hardware.repository.port';
import { EstadoHardware } from '@/hardware/domain/enums/estado-hardware.enum';
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
      tipo_componente: existingHardware.tipo_componente,
      numero_serie: existingHardware.numero_serie,
      marca_modelo: existingHardware.marca_modelo,
      proveedor: existingHardware.proveedor,
      fecha_compra: existingHardware.fecha_compra,
      costo_unitario: existingHardware.costo_unitario,
      url_factura: existingHardware.url_factura,
      // Alterna entre instalado y disponible
      estado: existingHardware.is_active
        ? EstadoHardware.DISPONIBLE
        : EstadoHardware.INSTALADO,
      id_equipo_actual: existingHardware.id_equipo_actual,
      created_at: existingHardware.created_at,
      updated_at: new Date(), // Actualizar la fecha de actualización
    });

    // Guardar el hardware actualizado en el repositorio
    await this.hardwareRepository.update(updatedHardware);

    // Devolver un mensaje indicando el nuevo estado del hardware
    return `El hardware con ID ${id} ahora está ${
      updatedHardware.is_active ? 'activo' : 'inactivo'
    }`;
  }
}
