import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/infrastructure/prisma/prisma.service';
import { SucursalRepositoryPort } from '@/clientes/domain/ports/sucursal.repository.port';
import { Sucursal } from '@/clientes/domain/entities/sucursal.entity';
import { SucursalMapper } from './mappers/sucursal.mapper';
import { Prisma } from '@prisma/client';
import { OptionDto } from '../../dtos/options.response.dto';

@Injectable()
export class SucursalPrismaRepository implements SucursalRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async save(sucursal: Sucursal): Promise<Sucursal> {
    const data = SucursalMapper.toPersistence(sucursal);

    if (sucursal.id_sucursal) {
      const updated = await this.prisma.sucursales.update({
        where: { id_sucursal: sucursal.id_sucursal },
        data,
      });
      return SucursalMapper.toDomain(updated);
    }

    const created = await this.prisma.sucursales.create({
      data: data as Prisma.sucursalesCreateInput,
    });
    return SucursalMapper.toDomain(created);
  }

  async findById(id: number): Promise<Sucursal | null> {
    const entity = await this.prisma.sucursales.findUnique({
      where: { id_sucursal: id },
    });
    if (!entity) return null;
    return SucursalMapper.toDomain(entity);
  }

  async getSucursalesOptions(clienteId: number): Promise<OptionDto[]> {
    const sucursales = await this.prisma.sucursales.findMany({
      where: { id_cliente: clienteId },
      select: {
        id_sucursal: true,
        nombre_sucursal: true,
      },
    });
    return sucursales.map((s) => ({
      id: s.id_sucursal,
      nombre: s.nombre_sucursal,
    }));
  }
}
