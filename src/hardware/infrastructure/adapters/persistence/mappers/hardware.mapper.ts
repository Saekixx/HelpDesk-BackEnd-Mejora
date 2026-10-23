import { hardware as PrismaHardware } from '@prisma/client';
import { Hardware } from '@/hardware/domain/entities/hardware.entity';

export class HardwareMapper {
  static toDomain(entity: PrismaHardware): Hardware {
    return new Hardware({
      id_hardware: entity.id_hardware,
      tipo_equipo: entity.tipo_componente,
      numero_serie: entity.numero_serie,
      fecha_compra: entity.fecha_compra ?? new Date(),
      marca: entity.marca_modelo,
      proveedor: entity.proveedor ?? '',
      url_factura: entity.url_factura ?? undefined,
      descripcion: undefined,
      ult_revision: undefined,
      rev_programada: undefined,
      is_active: entity.estado === 'Instalado',
      created_at: entity.created_at ?? undefined,
      updated_at: entity.updated_at ?? undefined,
    });
  }

  static toPersistence(domain: Hardware): Partial<PrismaHardware> {
    return {
      ...(domain.id_hardware && { id_hardware: domain.id_hardware }),
      tipo_componente: domain.tipo_equipo,
      numero_serie: domain.numero_serie,
      fecha_compra: domain.fecha_compra,
      marca_modelo: domain.marca,
      proveedor: domain.proveedor,
      url_factura: domain.url_factura,
      estado: domain.is_active ? 'Instalado' : 'En_Stock',
      created_at: domain.created_at,
      updated_at: domain.updated_at,
    };
  }
}
