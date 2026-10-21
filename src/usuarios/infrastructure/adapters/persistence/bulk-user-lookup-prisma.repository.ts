import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/infrastructure/prisma/prisma.service';
import { BulkUserLookupPort } from '@/usuarios/domain/ports/bulk-user-lookup.port';
import {
  BulkAreaLookup,
  BulkClienteLookup,
  BulkSucursalLookup,
} from '@/usuarios/domain/criteria/bulk-user-lookup.criteria';

@Injectable()
export class BulkUserLookupPrismaRepository implements BulkUserLookupPort {
  constructor(private readonly prisma: PrismaService) {}

  async findCliente(idCliente: number): Promise<BulkClienteLookup | null> {
    return this.prisma.clientes.findUnique({
      where: { id_cliente: idCliente },
      select: { id_cliente: true, nombre_principal: true },
    });
  }

  async findSucursalesByCliente(
    idCliente: number,
  ): Promise<BulkSucursalLookup[]> {
    return this.prisma.sucursales.findMany({
      where: { id_cliente: idCliente },
      select: { id_sucursal: true, nombre_sucursal: true },
    });
  }

  async findAreasBySucursales(
    sucursalIds: number[],
  ): Promise<BulkAreaLookup[]> {
    if (sucursalIds.length === 0) return [];

    const areas = await this.prisma.area.findMany({
      where: { id_sucursal: { in: sucursalIds } },
      select: { id_area: true, nombre_area: true, id_sucursal: true },
    });

    return areas.map((area) => ({
      id_area: area.id_area,
      nombre_area: area.nombre_area,
      id_sucursal: area.id_sucursal as number,
    }));
  }
}
