import {
  clientes as PrismaCliente,
  planes as PrismaPlan,
  sucursales as PrismaSucursal,
  clientes_tipo_cliente,
  Prisma,
} from '@prisma/client';
import {
  Cliente,
  ClienteListItem,
  ClienteDetail,
  ClienteDetailView,
  ContactoEnlaceView,
  TipoCliente,
} from '@/clientes/domain/entities/cliente.entity';
import { RolEnum } from '@/auth/domain/enums/rol.enum';

// Selección mínima que usa el listado paginado (GET /clientes): solo las
// columnas que necesita ClienteListItem, el nombre del plan (planes.tipo) y el
// conteo de sucursales. Se reutiliza en ClientePrismaRepository.findAll.
export const CLIENTE_LIST_SELECT = {
  id_cliente: true,
  nombre_principal: true,
  rubro: true,
  tipo_cliente: true,
  numero_documento: true,
  is_active: true,
  planes: { select: { tipo: true } },
  _count: { select: { sucursales: true } },
} satisfies Prisma.clientesSelect;

// Forma del resultado de Prisma al consultar con CLIENTE_LIST_SELECT.
export type PrismaClienteListRow = Prisma.clientesGetPayload<{
  select: typeof CLIENTE_LIST_SELECT;
}>;

// El contacto de enlace es el usuario
// representante de la empresa (rol CLIENTE_EMPRESA) y su cargo se deriva del rol.
const CARGO_CONTACTO_ENLACE = 'Representante de la empresa';

// Selección que usa el detalle (GET /clientes/:id). Se reutiliza en
// ClientePrismaRepository.findDetailById.
export const CLIENTE_DETAIL_SELECT = {
  id_cliente: true,
  nombre_principal: true,
  numero_documento: true,
  tipo_cliente: true,
  rubro: true,
  direccion: true,
  planes: {
    select: { id_plan: true, tipo: true, limite_equipos: true },
  },
  // Usuario representante: el activo con rol CLIENTE_EMPRESA más antiguo
  usuarios: {
    where: { is_active: true, rol: { nombre: RolEnum.CLIENTE_EMPRESA } },
    orderBy: [{ created_at: 'asc' }, { id_usuario: 'asc' }],
    take: 1,
    select: { nombre: true, apellido: true, correo: true, telefono: true },
  },
  sucursales: {
    where: { is_active: true },
    // La principal siempre primero; created_at/id_sucursal dan un orden estable
    orderBy: [
      { is_principal: 'desc' },
      { created_at: 'asc' },
      { id_sucursal: 'asc' },
    ],
    select: {
      id_sucursal: true,
      is_principal: true,
      nombre_sucursal: true,
      direccion: true,
      _count: { select: { equipos: true } },
    },
  },
} satisfies Prisma.clientesSelect;

// Forma del resultado de Prisma al consultar con CLIENTE_DETAIL_SELECT.
export type PrismaClienteDetailRow = Prisma.clientesGetPayload<{
  select: typeof CLIENTE_DETAIL_SELECT;
}>;

// Forma del resultado de Prisma cuando el findById incluye el plan completo
// y el listado de sucursales (ver ClientePrismaRepository.findById).
type PrismaClienteConRelaciones = PrismaCliente & {
  planes: PrismaPlan | null;
  sucursales: PrismaSucursal[];
};

export class ClienteMapper {
  static toDomain(entity: PrismaCliente): Cliente {
    return new Cliente({
      id_cliente: entity.id_cliente,
      tipo_cliente: entity.tipo_cliente as unknown as TipoCliente,
      numero_documento: entity.numero_documento ?? '',
      nombre_principal: entity.nombre_principal ?? '',
      direccion: entity.direccion ?? '',
      telefono: entity.telefono ?? '',
      correo: entity.correo ?? '',
      rubro: entity.rubro ?? '',
      fecha_inicio_plan: entity.fecha_inicio_plan ?? new Date(),
      fecha_finalizacion_plan: entity.fecha_finalizacion_plan ?? new Date(),
      costo_negociado: Number(entity.costo_negociado ?? 0),
      limite_equipos_contratado: entity.limite_equipos_contratado ?? 0,
      is_active: entity.is_active ?? true,
      id_plan: entity.id_plan ?? 0,
      fecha_registro: entity.fecha_registro ?? undefined,
      createdAt: entity.created_at ?? undefined,
      updatedAt: entity.updated_at ?? undefined,
    });
  }

  // Usado únicamente por el listado paginado (GET /clientes).
  static toListItem(entity: PrismaClienteListRow): ClienteListItem {
    return {
      id_cliente: entity.id_cliente,
      nombre_principal: entity.nombre_principal,
      rubro: entity.rubro ?? '',
      tipo_cliente: entity.tipo_cliente as unknown as TipoCliente,
      numero_documento: entity.numero_documento ?? '',
      totalSucursales: entity._count.sucursales,
      planSoporte: entity.planes?.tipo ?? null,
      estado: (entity.is_active ?? true) ? 'activo' : 'inactivo',
    };
  }

  // Usado por GET /clientes/:id, donde el repositorio incluye el plan
  // completo y el arreglo de sucursales del cliente.
  static toDetail(entity: PrismaClienteConRelaciones): ClienteDetail {
    const cliente = ClienteMapper.toDomain(entity);
    return {
      ...cliente,
      plan: entity.planes
        ? {
            id_plan: entity.planes.id_plan,
            nombre: entity.planes.tipo,
            tipo: entity.planes.tipo,
            precio: entity.planes.precio
              ? Number(entity.planes.precio)
              : undefined,
            limite_equipos: entity.planes.limite_equipos ?? undefined,
            is_active: entity.planes.is_active ?? undefined,
          }
        : null,
      sucursales: (entity.sucursales ?? []).map((s) => ({
        id_sucursal: s.id_sucursal,
        nombre: s.nombre_sucursal,
        encargado: s.encargado,
        telefono: s.telefono,
        correo: s.correo,
        direccion: s.direccion,
        is_active: s.is_active ?? true,
      })),
    };
  }

  // Usado por GET /clientes/:id. El orden de `sucursales_activas` lo define la
  // consulta (CLIENTE_DETAIL_SELECT): aquí solo se proyecta.
  static toDetailView(entity: PrismaClienteDetailRow): ClienteDetailView {
    const representante = entity.usuarios[0];
    const contacto: ContactoEnlaceView | null = representante
      ? {
          nombre_responsable:
            `${representante.nombre} ${representante.apellido}`.trim(),
          cargo: CARGO_CONTACTO_ENLACE,
          correo: representante.correo ?? '',
          telefono: representante.telefono ?? '',
        }
      : null;

    return {
      id_cliente: entity.id_cliente,
      nombre_principal: entity.nombre_principal,
      numero_documento: entity.numero_documento ?? '',
      tipo_cliente: entity.tipo_cliente as unknown as TipoCliente,
      rubro: entity.rubro,
      direccion: entity.direccion,
      plan: entity.planes
        ? {
            id_plan: entity.planes.id_plan,
            tipo: entity.planes.tipo,
            limite_equipos: entity.planes.limite_equipos ?? 0,
          }
        : null,
      contacto_enlace: contacto,
      sucursales_activas: entity.sucursales.map((s) => ({
        id_sucursal: s.id_sucursal,
        is_principal: s.is_principal ?? false,
        nombre: s.nombre_sucursal,
        direccion: s.direccion,
        total_equipos: s._count.equipos,
      })),
    };
  }

  static toPersistence(domain: Cliente): Partial<PrismaCliente> {
    return {
      ...(domain.id_cliente && { id_cliente: domain.id_cliente }),
      tipo_cliente: domain.tipo_cliente as unknown as clientes_tipo_cliente,
      numero_documento: domain.numero_documento,
      nombre_principal: domain.nombre_principal,
      direccion: domain.direccion || null,
      telefono: domain.telefono || null,
      correo: domain.correo || null,
      rubro: domain.rubro || null,
      fecha_inicio_plan: domain.fecha_inicio_plan,
      fecha_finalizacion_plan: domain.fecha_finalizacion_plan,
      costo_negociado: new Prisma.Decimal(domain.costo_negociado ?? 0),
      limite_equipos_contratado: domain.limite_equipos_contratado,
      is_active: domain.is_active,
      id_plan: domain.id_plan,
    };
  }
}