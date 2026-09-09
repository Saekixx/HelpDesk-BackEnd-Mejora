import {
  clientes as PrismaCliente,
  clientes_tipo_cliente,
  Prisma,
} from '@prisma/client';
import {
  Cliente,
  TipoCliente,
} from '@/clientes/domain/entities/cliente.entity';

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
