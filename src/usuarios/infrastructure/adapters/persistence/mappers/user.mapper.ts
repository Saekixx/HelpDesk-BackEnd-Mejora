import { Prisma, usuarios as PrismaUsuario } from '@prisma/client';
import { User } from '@/usuarios/domain/entities/user.entity';
import { UserOptions } from '@/usuarios/domain/criteria/user-options.dto';
import { UserListItemCriteria } from '@/usuarios/domain/criteria/user-list-item.criteria';

// Selección mínima del listado paginado (GET /usuario): solo las columnas de
// UserListItemCriteria y el nombre de cada relación (nunca se trae el password).
export const USER_LIST_SELECT = {
  id_usuario: true,
  nombre: true,
  apellido: true,
  correo: true,
  is_active: true,
  rol: { select: { nombre: true } },
  clientes: { select: { nombre_principal: true } },
  sucursales: { select: { nombre_sucursal: true } },
  area: { select: { nombre_area: true } },
} satisfies Prisma.usuariosSelect;

// Forma del resultado de Prisma al consultar con USER_LIST_SELECT
export type PrismaUserListRow = Prisma.usuariosGetPayload<{
  select: typeof USER_LIST_SELECT;
}>;

// Tipo para consultas de Prisma que solo devuelven opciones de usuario
type PrismaUserSelectOption = {
  id_usuario: number;
  nombre: string;
  apellido: string;
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

  // Usado únicamente por el listado paginado (GET /usuario)
  static toListItem(entity: PrismaUserListRow): UserListItemCriteria {
    return {
      id_usuario: entity.id_usuario,
      nombre: entity.nombre,
      apellido: entity.apellido,
      correo: entity.correo ?? '',
      rol: entity.rol?.nombre ?? 'Sin Rol',
      empresa: entity.clientes?.nombre_principal ?? null,
      sucursal: entity.sucursales?.nombre_sucursal ?? null,
      area: entity.area?.nombre_area ?? null,
      estado: (entity.is_active ?? true) ? 'ACTIVO' : 'INACTIVO',
    };
  }

  static toUserOptions(entity: PrismaUserSelectOption): UserOptions {
    return {
      id: entity.id_usuario,
      nombre: `${entity.nombre} ${entity.apellido}`,
    };
  }
}
