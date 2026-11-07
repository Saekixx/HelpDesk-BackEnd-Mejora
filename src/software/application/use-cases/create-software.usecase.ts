import {
  SOFTWARE_REPOSITORY,
  SoftwareRepositoryPort,
} from '@/software/domain/ports/software.repository.port';
import { Inject, Injectable } from '@nestjs/common';
import { CreateSoftwareDto } from '../dtos/create-software.dto';
import { Software } from '@/software/domain/entities/software.entity';
import * as crypto from 'crypto';

@Injectable()
export class CreateSoftwareUseCase {
  constructor(
    @Inject(SOFTWARE_REPOSITORY)
    private readonly softwareRepository: SoftwareRepositoryPort,
  ) {}

  private encryptMasterKey(text: string): string {
    const secretKey = process.env.ENCRYPTION_KEY || 'tu-clave-secreta-de-32-bytes-exactos!';
    const iv = crypto.randomBytes(16);
    const key = crypto.createHash('sha256').update(secretKey).digest();
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  }

  async execute(softwareData: CreateSoftwareDto): Promise<void> {
    // 1. Regla de negocio para el límite de equipos según el tipo de licencia
    let limiteFinal = softwareData.limite_equipos ?? 1;
    if ((softwareData.tipo_licencia as string) === 'Unico') {
      limiteFinal = 1;
    }

    // 2. Cifrar la master key si viene incluida en la petición
    let encryptedMasterKey: string | undefined = undefined;
    if (softwareData.licencia_master_key) {
      encryptedMasterKey = this.encryptMasterKey(softwareData.licencia_master_key);
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
      fecha_compra: softwareData.fecha_compra ? new Date(softwareData.fecha_compra) : undefined,
      fecha_caducidad: softwareData.fecha_caducidad ? new Date(softwareData.fecha_caducidad) : undefined,
      is_active: softwareData.is_active ?? true,
    });

    // Guardar el nuevo software en el repositorio
    await this.softwareRepository.save(newSoftware);
  }
}
