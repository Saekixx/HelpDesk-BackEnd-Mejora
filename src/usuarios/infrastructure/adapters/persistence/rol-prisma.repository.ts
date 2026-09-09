import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/infrastructure/prisma/prisma.service';
import { Rol } from '@/usuarios/domain/entities/rol.entity';
import { RolRepositoryPort } from '@/usuarios/domain/ports/rol.repository.port';
import { RolMapper } from './mappers/rol.mapper';

@Injectable()
export class RolPrismaRepository implements RolRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: number): Promise<Rol | null> {
    const entity = await this.prisma.rol.findUnique({
      where: { id_rol: id },
    });
    if (!entity) return null;
    return RolMapper.toDomain(entity);
  }
}
