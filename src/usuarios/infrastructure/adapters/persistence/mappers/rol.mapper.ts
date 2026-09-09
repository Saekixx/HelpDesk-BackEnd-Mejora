import { rol as PrismaRol } from '@prisma/client';
import { Rol } from '@/usuarios/domain/entities/rol.entity';

export class RolMapper {
  static toDomain(prismaRol: PrismaRol): Rol {
    return new Rol({
      id_rol: prismaRol.id_rol,
      nombre: prismaRol.nombre,
      createdAt: prismaRol.created_at ?? undefined,
    });
  }

  static toPersistence(domain: Rol): Partial<PrismaRol> {
    return {
      ...(domain.id_rol && { id_rol: domain.id_rol }),
      nombre: domain.nombre,
    };
  }
}
