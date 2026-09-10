import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/infrastructure/prisma/prisma.service';
import {
  PaginatedUsersResult,
  UserRepositoryPort,
} from '@/usuarios/domain/ports/user.repository.port';
import { User } from '@/usuarios/domain/entities/user.entity';
import { UserFilterCriteria } from '@/usuarios/domain/criteria/user-filter.criteria';
import { UserMapper } from './mappers/user.mapper';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserPrismaRepository implements UserRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async save(user: User): Promise<User> {
    const data = UserMapper.toPersistence(user);

    if (user.id_usuario) {
      const updated = await this.prisma.usuarios.update({
        where: { id_usuario: user.id_usuario },
        data,
      });
      return UserMapper.toDomain(updated);
    }

    const created = await this.prisma.usuarios.create({
      data: data as Prisma.usuariosCreateInput,
    });
    return UserMapper.toDomain(created);
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

  async findAllWithFilters(
    filters: UserFilterCriteria,
  ): Promise<PaginatedUsersResult> {
    const {
      page = 1,
      limit = 10,
      search,
      id_rol,
      id_cliente,
      id_sucursal,
      id_area,
      is_active,
    } = filters;

    const where: Prisma.usuariosWhereInput = {};

    if (search) {
      where.OR = [
        { nombre: { contains: search } },
        { apellido: { contains: search } },
        { correo: { contains: search } },
      ];
    }

    if (id_rol) where.id_rol = id_rol;
    if (id_cliente) where.id_cliente = id_cliente;
    if (id_sucursal) where.id_sucursal = id_sucursal;
    if (id_area) where.id_area = id_area;

    if (
      is_active !== undefined &&
      is_active !== null &&
      String(is_active) !== ''
    ) {
      where.is_active =
        is_active === true || String(is_active).toLowerCase() === 'true';
    }

    const skip = (page - 1) * limit;

    const [entities, total] = await Promise.all([
      this.prisma.usuarios.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          rol: { select: { nombre: true } },
          clientes: { select: { nombre_principal: true } },
          sucursales: { select: { nombre_sucursal: true } },
          area: { select: { nombre_area: true } },
        },
      }),
      this.prisma.usuarios.count({ where }),
    ]);

    return {
      data: entities.map(UserMapper.toResponseDto),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
