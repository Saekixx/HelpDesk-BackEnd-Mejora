import {
  HARDWARE_REPOSITORY,
  HardwareRepositoryPort,
} from '@/hardware/domain/ports/hardware.repository.port';
import { Inject, Injectable } from '@nestjs/common';
import { CreateHardwareDto } from '../dtos/create-hardware.dto';
import { Hardware } from '@/hardware/domain/entities/hardware.entity';

@Injectable()
export class CreateHardwareUseCase {
  constructor(
    @Inject(HARDWARE_REPOSITORY)
    private readonly hardwareRepository: HardwareRepositoryPort,
  ) {}

  async execute(hardwareData: CreateHardwareDto): Promise<void> {
    // Mapear los datos del DTO a la entidad Hardware respetando el schema de Prisma
    const newHardware = new Hardware({
      tipo_equipo: hardwareData.tipo_equipo,
      numero_serie: hardwareData.numero_serie,
      fecha_compra: new Date(hardwareData.fecha_compra),
      marca: hardwareData.marca,
      proveedor: hardwareData.proveedor,
      url_factura: hardwareData.url_factura,
      descripcion: hardwareData.descripcion,
      ult_revision: hardwareData.ult_revision
        ? new Date(hardwareData.ult_revision)
        : undefined,
      rev_programada: hardwareData.rev_programada
        ? new Date(hardwareData.rev_programada)
        : undefined,
      is_active: hardwareData.is_active ?? true,
    });

    // Guardar el nuevo hardware en el repositorio
    await this.hardwareRepository.save(newHardware);
  }
}