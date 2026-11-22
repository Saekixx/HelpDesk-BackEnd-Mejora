import { sucursales as PrismaSucursal } from '@prisma/client';
import {
  Sucursal,
  SucursalDetail,
  SucursalListItem,
} from '@/clientes/domain/entities/sucursal.entity';

// Forma del resultado de Prisma cuando el findAll incluye el conteo de
// áreas, los datos del cliente, la zona y el primer usuario (encargado)
// (ver SucursalPrismaRepository.findAll).
type PrismaSucursalConDetalle = PrismaSucursal & {
  _count: { area: number };
  clientes: {
    id_cliente: number;
    nombre_principal: string;
    numero_documento: string | null;
  } | null;
  zonas: { id_zona: number; nombre_zona: string } | null;
  usuarios: { id_usuario: number; nombre: string; apellido: string }[];
};

// Forma del resultado de Prisma en findDetailById: áreas, cliente y primer
// usuario (encargado) de la sucursal.
type PrismaSucursalDetalle = PrismaSucursal & {
  area: { id_area: number; nombre_area: string; is_active: boolean | null }[];
  clientes: {
    id_cliente: number;
    nombre_principal: string;
    numero_documento: string | null;
  } | null;
  usuarios: { id_usuario: number; nombre: string; apellido: string }[];
};

export class SucursalMapper {
  static toDomain(entity: PrismaSucursal): Sucursal {
    return new Sucursal({
      id_sucursal: entity.id_sucursal,
      nombre_sucursal: entity.nombre_sucursal,
      encargado: entity.encargado ?? undefined,
      telefono: entity.telefono ?? undefined,
      direccion: entity.direccion ?? undefined,
      correo: entity.correo ?? undefined,
      is_active: entity.is_active ?? true,
      id_cliente: entity.id_cliente ?? 0,
      id_zona: entity.id_zona ?? 0,
      createdAt: entity.created_at ?? undefined,
      updatedAt: entity.updated_at ?? undefined,
    });
  }

  // Usado únicamente por el listado paginado (GET /sucursales), donde el
  // repositorio incluye _count.area y las relaciones `clientes`, `zonas`
  // y `usuarios` (take: 1, el primero hace de encargado).
  static toListItem(entity: PrismaSucursalConDetalle): SucursalListItem {
    const usuario = entity.usuarios[0];
    return {
      id_sucursal: entity.id_sucursal,
      nombre_sucursal: entity.nombre_sucursal,
      direccion: entity.direccion,
      total_areas: entity._count.area,
      is_active: entity.is_active ?? true,
      cliente_empresa: entity.clientes
        ? {
            id_cliente: entity.clientes.id_cliente,
            nombre: entity.clientes.nombre_principal,
            numero_documento: entity.clientes.numero_documento,
          }
        : null,
      // Nombre y apellido vienen del usuario; teléfono y correo de contacto
      // son los de la propia sucursal.
      encargado: usuario
        ? {
            id_usuario: usuario.id_usuario,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            telefono_contacto: entity.telefono,
            correo: entity.correo,
          }
        : null,
      zona: entity.zonas
        ? {
            id_zona: entity.zonas.id_zona,
            nombre: entity.zonas.nombre_zona,
          }
        : null,
      createdAt: entity.created_at ?? new Date(),
      updatedAt: entity.updated_at ?? new Date(),
    };
  }

  // Usado únicamente por el detalle (GET /sucursales/:id).
  static toDetail(entity: PrismaSucursalDetalle): SucursalDetail {
    const sucursal = SucursalMapper.toDomain(entity);
    const [usuario] = entity.usuarios;
    return {
      id_sucursal: entity.id_sucursal,
      nombre_sucursal: sucursal.nombre_sucursal,
      is_active: sucursal.is_active,
      direccion: sucursal.direccion,
      id_zona: entity.id_zona,
      areasVinculadas: entity.area.map((area) => ({
        id_area: area.id_area,
        nombre_area: area.nombre_area,
        is_active: area.is_active ?? true,
      })),
      clienteEmpresa: entity.clientes
        ? {
            id_cliente: entity.clientes.id_cliente,
            nombre_principal: entity.clientes.nombre_principal,
            numero_documento: entity.clientes.numero_documento,
          }
        : null,
      encargado: usuario
        ? {
            id_usuario: usuario.id_usuario,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            telefono_contacto: entity.telefono,
            correo_corporativo: entity.correo,
          }
        : null,
      createdAt: sucursal.createdAt,
      updatedAt: sucursal.updatedAt,
    };
  }

  static toPersistence(domain: Sucursal): Partial<PrismaSucursal> {
    return {
      ...(domain.id_sucursal && { id_sucursal: domain.id_sucursal }),
      nombre_sucursal: domain.nombre_sucursal,
      encargado: domain.encargado,
      telefono: domain.telefono,
      direccion: domain.direccion,
      correo: domain.correo,
      is_active: domain.is_active,
      id_cliente: domain.id_cliente,
    };
  }
}
