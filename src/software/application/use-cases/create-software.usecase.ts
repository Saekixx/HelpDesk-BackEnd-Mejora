import {
  SOFTWARE_REPOSITORY,
  SoftwareRepositoryPort,
} from '@/software/domain/ports/software.repository.port';
import { Inject, Injectable } from '@nestjs/common';
import { CreateSoftwareDto } from '../dtos/create-software.dto';
import { Software } from '@/software/domain/entities/software.entity';
import { EncryptMasterKeyUtil } from '@/common/utils/encrypt-master-key.util';

@Injectable()
export class CreateSoftwareUseCase {
  constructor(
    @Inject(SOFTWARE_REPOSITORY)
    private readonly softwareRepository: SoftwareRepositoryPort,
  ) {}

  async execute(softwareData: CreateSoftwareDto): Promise<void> {
    // Crear una instancia de EncryptMasterKeyUtil para manejar el cifrado y descifrado de la master key
    const encryptMasterKeyUtil = new EncryptMasterKeyUtil();

    // Regla de negocio para el límite de equipos según el tipo de licencia
    let limiteFinal = softwareData.limite_equipos ?? 1;
    if ((softwareData.tipo_licencia as string) === 'Unico') {
      limiteFinal = 1;
    }

    // ifrar la master key si viene incluida en la petición
    let encryptedMasterKey: string | undefined = undefined;
    if (softwareData.licencia_master_key) {
      encryptedMasterKey = encryptMasterKeyUtil.encryptMasterKey(
        softwareData.licencia_master_key,
      );
    }

    // Mapear los datos del DTO a la entidad Software con los campos reales
    const newSoftware = new Software({
      id_cliente: softwareData.id_cliente,
      id_sucursal: softwareData.id_sucursal,
      nombre_software: softwareData.nombre_software,
      categoria: softwareData.categoria,
      tipo_licencia: softwareData.tipo_licencia,
      licencia_master_key: encryptedMasterKey,
      proveedor: softwareData.proveedor,
      limite_equipos: limiteFinal,
      url_factura: softwareData.url_factura,
      fecha_compra: softwareData.fecha_compra
        ? new Date(softwareData.fecha_compra)
        : undefined,
      fecha_caducidad: softwareData.fecha_caducidad
        ? new Date(softwareData.fecha_caducidad)
        : undefined,
      is_active: softwareData.is_active ?? true,
    });

    // Guardar el nuevo software en el repositorio
    await this.softwareRepository.save(newSoftware);
  }
}
