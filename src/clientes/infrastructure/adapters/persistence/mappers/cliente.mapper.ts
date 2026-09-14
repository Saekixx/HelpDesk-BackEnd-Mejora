import {
  clientes as PrismaCliente,
  clientes_tipo_cliente,
  Prisma,
} from '@prisma/client';
import {
  Cliente,
  ClienteListItem,
  TipoCliente,
} from '@/clientes/domain/entities/cliente.entity';

// Forma del resultado de Prisma cuando el findAll incluye el conteo de
// sucursales y los datos del plan (ver ClientePrismaRepository.findAll).
type PrismaClienteConDetalle = PrismaCliente & {
  _count: { sucursales: number };
  planes: { id_plan: number; tipo: string } | null;
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

  // Usado únicamente por el listado paginado (GET /clientes), donde el
  // repositorio incluye _count.sucursales y la relación `planes`.
  static toListItem(entity: PrismaClienteConDetalle): ClienteListItem {
    const cliente = ClienteMapper.toDomain(entity);
    return {
      ...cliente,
      total_sucursales: entity._count.sucursales,
      plan: entity.planes
        ? { id_plan: entity.planes.id_plan, nombre: entity.planes.tipo }
        : null,
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