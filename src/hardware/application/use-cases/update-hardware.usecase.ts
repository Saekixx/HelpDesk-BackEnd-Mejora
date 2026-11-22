import { Inject, Injectable } from '@nestjs/common';
import { Hardware } from '@/hardware/domain/entities/hardware.entity';
import { HardwareNotFoundException } from '@/hardware/domain/exceptions/hardware.exceptions';
import {
  HARDWARE_REPOSITORY,
  HardwareRepositoryPort,
} from '@/hardware/domain/ports/hardware.repository.port';
import { UpdateHardwareDto } from '../dtos/update-hardware.dto';

@Injectable()
export class UpdateHardwareUseCase {
  constructor(
    @Inject(HARDWARE_REPOSITORY)
    private readonly hardwareRepository: HardwareRepositoryPort,
  ) {}

  /**
   * Actualiza parcialmente la ficha técnica de un hardware.
   * Solo se modifican los campos enviados: los omitidos (o null) conservan su
   * valor actual. El estado y el equipo asignado nunca cambian aquí.
   * Lanza HardwareNotFoundException (404) si el hardware no existe.
   */
  async execute(id: number, dto: UpdateHardwareDto): Promise<Hardware> {
    const existing = await this.hardwareRepository.findById(id);
    if (!existing) throw new HardwareNotFoundException(id);

    // Sin campos que cambiar no se escribe en BD ni se altera `updated_at`.
    if (!this.hayCambios(dto)) return existing;

    const updated = new Hardware({
      id_hardware: existing.id_hardware,
      tipo_componente: dto.tipo_componente ?? existing.tipo_componente,
      numero_serie: dto.numero_serie ?? existing.numero_serie,
      marca_modelo: dto.marca_modelo ?? existing.marca_modelo,
      proveedor: dto.proveedor ?? existing.proveedor,
      fecha_compra: dto.fecha_compra
        ? new Date(dto.fecha_compra)
        : existing.fecha_compra,
      // `??` y no `||`: un costo de 0 es un valor válido, no "sin valor".
      costo_unitario: dto.costo_unitario ?? existing.costo_unitario,
      url_factura: dto.url_factura ?? existing.url_factura,
      estado: existing.estado,
      id_equipo_actual: existing.id_equipo_actual,
      created_at: existing.created_at,
      updated_at: new Date(),
    });

    return this.hardwareRepository.update(updated);
  }

  private hayCambios(dto: UpdateHardwareDto): boolean {
    return Object.values(dto).some(
      (valor) => valor !== undefined && valor !== null,
    );
  }
}
