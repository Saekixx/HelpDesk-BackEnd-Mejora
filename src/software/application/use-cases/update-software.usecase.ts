import { Software } from '@/software/domain/entities/software.entity';
import {
  SOFTWARE_REPOSITORY,
  SoftwareRepositoryPort,
} from '@/software/domain/ports/software.repository.port';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateSoftwareDto } from '../dtos/update-software.dto';
import { EncryptMasterKeyUtil } from '@/common/utils/encrypt-master-key.util';

@Injectable()
export class UpdateSoftwareUseCase {
  constructor(
    @Inject(SOFTWARE_REPOSITORY)
    private readonly softwareRepository: SoftwareRepositoryPort,
  ) {}

  async execute(id: number, softwareData: UpdateSoftwareDto): Promise<void> {
    const existingSoftware = await this.softwareRepository.findById(id);
    if (!existingSoftware) {
      throw new NotFoundException(`El software con ID ${id} no existe`);
    }

    let encryptedMasterKey: string | undefined = undefined;
    if (softwareData.licencia_master_key) {
      const encryptMasterKeyUtil = new EncryptMasterKeyUtil();
      encryptedMasterKey = encryptMasterKeyUtil.encryptMasterKey(
        softwareData.licencia_master_key,
      );
    }

    const updatedSoftware = new Software({
      id_software: existingSoftware.id_software,
      id_cliente: softwareData.id_cliente ?? existingSoftware.id_cliente,
      id_sucursal: existingSoftware.id_sucursal,
      nombre_software:
        softwareData.nombre_software ?? existingSoftware.nombre_software,
      categoria: softwareData.categoria ?? existingSoftware.categoria,
      tipo_licencia:
        softwareData.tipo_licencia ?? existingSoftware.tipo_licencia,
      licencia_master_key:
        encryptedMasterKey ?? existingSoftware.licencia_master_key,
      proveedor: softwareData.proveedor ?? existingSoftware.proveedor,
      limite_equipos:
        softwareData.limite_equipos ?? existingSoftware.limite_equipos,
      licencias_usadas: existingSoftware.licencias_usadas,
      url_factura: existingSoftware.url_factura,
      fecha_compra: existingSoftware.fecha_compra,
      fecha_caducidad: softwareData.fecha_caducidad
        ? new Date(softwareData.fecha_caducidad)
        : existingSoftware.fecha_caducidad,
      estado: existingSoftware.estado,
      is_active: existingSoftware.is_active,
      createdAt: existingSoftware.createdAt,
      updatedAt: new Date(),
    });

    await this.softwareRepository.save(updatedSoftware);
  }
}
