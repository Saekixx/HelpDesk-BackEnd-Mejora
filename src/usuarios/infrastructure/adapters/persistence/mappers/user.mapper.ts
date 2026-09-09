import { usuarios as PrismaUsuario } from '@prisma/client';
import { UserResponseDto } from '@/usuarios/application/dtos/user-response.dto';
import { User } from '@/usuarios/domain/entities/user.entity';

// Tipo extendido para consultas de Prisma con relaciones
export type PrismaUserWithRelations = PrismaUsuario & {
  rol?: { nombre: string } | null;
  clientes?: { nombre_principal: string } | null;
  sucursales?: { nombre_sucursal: string } | null;
  area?: { nombre_area: string } | null;
};

export class UserMapper {
  static toDomain(entity: PrismaUsuario): User {
    return new User({
      id_usuario: entity.id_usuario,
      nombre: entity.nombre,
      apellido: entity.apellido,
      correo: entity.correo ?? '',
      password: entity.password,
      telefono: entity.telefono ?? '',
      is_active: entity.is_active ?? true,
      id_rol: entity.id_rol ?? 0,
      id_cliente: entity.id_cliente ?? null,
      id_sucursal: entity.id_sucursal ?? null,
      id_area: entity.id_area ?? null,
      createdAt: entity.created_at ?? undefined,
      updatedAt: entity.updated_at ?? undefined,
    });
  }

  static toPersistence(domain: User): Partial<PrismaUsuario> {
    return {
      ...(domain.id_usuario && { id_usuario: domain.id_usuario }),
      nombre: domain.nombre,
      apellido: domain.apellido,
      correo: domain.correo,
      password: domain.password,
      telefono: domain.telefono,
      is_active: domain.is_active,
      id_rol: domain.id_rol,
      id_cliente: domain.id_cliente,
      id_sucursal: domain.id_sucursal,
      id_area: domain.id_area,
    };
  }

  static toResponseDto(entity: PrismaUserWithRelations): UserResponseDto {
    return {
      id_usuario: entity.id_usuario,
      nombre: entity.nombre,
      apellido: entity.apellido,
      correo: entity.correo ?? '',
      telefono: entity.telefono ?? '',
      is_active: entity.is_active ?? true,
      createdAt: entity.created_at ?? new Date(),
      updatedAt: entity.updated_at ?? new Date(),

      id_rol: entity.id_rol ?? 0,
      id_cliente: entity.id_cliente ?? null,
      id_sucursal: entity.id_sucursal ?? null,
      id_area: entity.id_area ?? null,

      nombre_rol: entity.rol?.nombre || 'Sin Rol',
      nombre_cliente: entity.clientes?.nombre_principal || null,
      nombre_sucursal: entity.sucursales?.nombre_sucursal || null,
      nombre_area: entity.area?.nombre_area || null,
    };
  }
}
