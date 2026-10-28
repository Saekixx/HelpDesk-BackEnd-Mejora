import { AreaEntity } from '../../../../domain/entities/area.entity';

export class AreaMapper {
  static toDomain(prismaModel: any): AreaEntity {
    return new AreaEntity(
      prismaModel.id_area,
      prismaModel.codigo_area ?? `AR-${prismaModel.id_area}`,
      prismaModel.nombre_area,
      prismaModel.id_sucursal,
      prismaModel.contacto_responsable,
      prismaModel.telefono,
      prismaModel.correo_electronico,
      prismaModel.is_active ?? true,
      prismaModel.sucursales?.nombre_sucursal,
      prismaModel.sucursales?.clientes?.nombre_principal,
      prismaModel._count?.equipos ?? prismaModel.equipos?.length ?? 0,
      prismaModel._count?.tickets ?? prismaModel.tickets?.length ?? 0,
      prismaModel.created_at,
      prismaModel.updated_at,
    );
  }
}