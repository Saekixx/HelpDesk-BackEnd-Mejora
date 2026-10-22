import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/infrastructure/prisma/prisma.service';
import {
  PaginatedUsersResult,
  UserRepositoryPort,
} from '@/usuarios/domain/ports/user.repository.port';
import { User } from '@/usuarios/domain/entities/user.entity';
import { UserFilterCriteria } from '@/usuarios/domain/criteria/user-filter.criteria';
import { UserStatsCriteria } from '@/usuarios/domain/criteria/user-stats.criteria';
import { RolEnum } from '@/auth/domain/enums/rol.enum';
import { UserMapper, USER_LIST_SELECT } from './mappers/user.mapper';
import { UsersBatchConflictException } from '@/usuarios/domain/exceptions/user.exceptions';
import { Prisma } from '@prisma/client';
import { UserSelectFilterDto } from '../../dtos/user-select-filter-dto';
import { UserOptions } from '../../dtos/user-options.dto';

const ROLES_TECNICOS: string[] = [
  RolEnum.ADMINISTRADOR,
  RolEnum.SOPORTE_INSITU,
  RolEnum.SOPORTE_TECNICO,
];

const ROLES_CLIENTES: string[] = [
  RolEnum.CLIENTE_EMPRESA,
  RolEnum.CLIENTE_SUCURSAL,
  RolEnum.CLIENTE_TRABAJADOR,
];

@Injectable()
export class UserPrismaRepository implements UserRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async save(user: User, zonasIds?: number[]): Promise<User> {
    const data = UserMapper.toPersistence(user);

    // Si es actualización
    if (user.id_usuario) {
      const updated = await this.prisma.usuarios.update({
        where: { id_usuario: user.id_usuario },
        data: {
          ...data,
          // Si enviaron un arreglo con zonas, las reemplazamos
          ...(zonasIds && zonasIds.length > 0
            ? {
                tecnicos_zonas: {
                  deleteMany: {}, // Borra las zonas anteriores
                  createMany: {
                    data: zonasIds.map((id_zona) => ({ id_zona })),
                  },
                },
              }
            : zonasIds && zonasIds.length === 0
              ? {
                  tecnicos_zonas: {
                    deleteMany: {}, // Si mandaron explícitamente [], desasigna todas las zonas
                  },
                }
              : {}), // Si es undefined, no toca nada
        },
      });
      return UserMapper.toDomain(updated);
    }

    // Si es creación nueva
    const created = await this.prisma.usuarios.create({
      data: {
        ...(data as Prisma.usuariosCreateInput),
        ...(zonasIds &&
          zonasIds.length > 0 && {
            tecnicos_zonas: {
              createMany: {
                data: zonasIds.map((id_zona) => ({ id_zona })),
              },
            },
          }),
      },
    });

    return UserMapper.toDomain(created);
  }

  async saveMany(users: User[]): Promise<User[]> {
    try {
      // Una sola transacción: si falla un insert se revierten todos
      const created = await this.prisma.$transaction(
        users.map((user) =>
          this.prisma.usuarios.create({
            data: UserMapper.toPersistence(user) as Prisma.usuariosCreateInput,
          }),
        ),
      );
      return created.map((entity) => UserMapper.toDomain(entity));
    } catch (error) {
      // P2002: violación de unicidad (correo registrado entre la validación y el registro)
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new UsersBatchConflictException();
      }
      throw error;
    }
  }

  async findByCorreo(correo: string): Promise<User | null> {
    const entity = await this.prisma.usuarios.findUnique({
      where: { correo },
    });
    if (!entity) return null;
    return UserMapper.toDomain(entity);
  }

  async findById(id: number): Promise<User | null> {
    const entity = await this.prisma.usuarios.findUnique({
      where: { id_usuario: Number(id) },
    });
    if (!entity) return null;
    return UserMapper.toDomain(entity);
  }

  async existsByCorreo(correo: string): Promise<boolean> {
    const count = await this.prisma.usuarios.count({
      where: { correo },
    });
    return count > 0;
  }

  async findExistingCorreos(correos: string[]): Promise<string[]> {
    if (correos.length === 0) return [];

    const users = await this.prisma.usuarios.findMany({
      where: { correo: { in: correos } },
      select: { correo: true },
    });

    return users.map((user) => (user.correo ?? '').toLowerCase());
  }

  async findAllWithFilters(
    filters: UserFilterCriteria,
  ): Promise<PaginatedUsersResult> {
    const { page = 1, limit = 10 } = filters;
    const where = this.buildListWhere(filters);

    const [entities, total] = await Promise.all([
      this.prisma.usuarios.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        // id_usuario como desempate: las cargas masivas comparten created_at
        // y la paginación debe ser estable
        orderBy: [{ created_at: 'desc' }, { id_usuario: 'desc' }],
        select: USER_LIST_SELECT,
      }),
      this.prisma.usuarios.count({ where }),
    ]);

    return {
      data: entities.map(UserMapper.toListItem),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // Construye el criterio del listado a partir de los query params.
  // - search: coincidencia parcial en nombre, apellido, correo y nombre de la empresa.
  // - id_rol / rol: filtro por rol (prevalece id_rol si llegan ambos).
  // - is_active / estado: usuarios activos o inactivos (prevalece is_active).
  private buildListWhere({
    search,
    id_rol,
    rol,
    is_active,
    estado,
  }: UserFilterCriteria): Prisma.usuariosWhereInput {
    const where: Prisma.usuariosWhereInput = {};

    const term = search?.trim();
    if (term) {
      where.OR = [
        { nombre: { contains: term } },
        { apellido: { contains: term } },
        { correo: { contains: term } },
        { clientes: { nombre_principal: { contains: term } } },
      ];
    }

    if (id_rol !== undefined) where.id_rol = id_rol;
    else if (rol) where.rol = { nombre: rol };

    const activo =
      is_active ?? (estado !== undefined ? estado === 'activo' : undefined);
    if (activo !== undefined) where.is_active = activo;

    return where;
  }

  async findActiveRolUsers(
    filters: UserSelectFilterDto,
  ): Promise<UserOptions[]> {
    const { search, id_sucursal, id_area, id_cliente, rol } = filters;

    const where: Prisma.usuariosWhereInput = {
      is_active: true,
      ...(id_sucursal && { id_sucursal }),
      ...(id_area && { id_area }),
      ...(id_cliente && { id_cliente }),
      ...(rol && {
        rol: {
          nombre: rol,
        },
      }),
    };

    if (search) {
      where.OR = [
        { nombre: { contains: search } },
        { apellido: { contains: search } },
      ];
    }

    const entities = await this.prisma.usuarios.findMany({
      where,
      select: {
        id_usuario: true,
        nombre: true,
        apellido: true,
      },
      take: 20,
    });

    return entities.map((entity) => UserMapper.toUserOptions(entity));
  }

  async getUserStats(): Promise<UserStatsCriteria> {
    const [total, activos, inactivos, tecnicos, clientes] =
      await this.prisma.$transaction([
        this.prisma.usuarios.count(),
        this.prisma.usuarios.count({ where: { is_active: true } }),
        this.prisma.usuarios.count({ where: { is_active: false } }),
        this.prisma.usuarios.count({
          where: { rol: { nombre: { in: ROLES_TECNICOS } } },
        }),
        this.prisma.usuarios.count({
          where: { rol: { nombre: { in: ROLES_CLIENTES } } },
        }),
      ]);

    return {
      totalUsuarios: { cantidad: total, activos, inactivos },
      personalTecnico: { cantidad: tecnicos },
      cuentasClientes: { cantidad: clientes },
    };
  }
}
