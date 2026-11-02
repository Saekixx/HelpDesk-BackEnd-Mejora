import { Hardware } from '@/hardware/domain/entities/hardware.entity';
import {
  HARDWARE_REPOSITORY,
  HardwareRepositoryPort,
} from '@/hardware/domain/ports/hardware.repository.port';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
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
      tipo_componente:
        hardwareData.tipo_componente ?? existingHardware.tipo_componente,
      numero_serie: hardwareData.numero_serie ?? existingHardware.numero_serie,
      marca_modelo: hardwareData.marca_modelo ?? existingHardware.marca_modelo,
      proveedor: hardwareData.proveedor ?? existingHardware.proveedor,
      fecha_compra: hardwareData.fecha_compra
        ? new Date(hardwareData.fecha_compra)
        : existingHardware.fecha_compra,
      costo_unitario:
        hardwareData.costo_unitario ?? existingHardware.costo_unitario,
      url_factura: hardwareData.url_factura ?? existingHardware.url_factura,
      estado: existingHardware.estado,
      id_equipo_actual: existingHardware.id_equipo_actual,
      created_at: existingHardware.created_at,
      updated_at: new Date(), // Actualizar la fecha de actualización
    });

    // Guardar el hardware actualizado en el repositorio
    await this.hardwareRepository.update(updatedHardware);
  }
}
