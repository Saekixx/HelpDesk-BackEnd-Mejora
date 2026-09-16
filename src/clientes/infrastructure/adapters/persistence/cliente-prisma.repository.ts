import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/infrastructure/prisma/prisma.service';
import {
  ClienteRepositoryPort,
  PaginatedClientesResult,
  NuevoClienteSucursalesInput,
  ActualizarClienteSucursalesInput,
} from '@/clientes/domain/ports/cliente.repository.port';
import {
  Cliente,
  ClienteDetail,
} from '@/clientes/domain/entities/cliente.entity';
import { GetClientesFilterDto } from '@/clientes/domain/dto/get-clientes-filter.dto';
import { ClienteNotFoundException } from '@/clientes/domain/exceptions/cliente.exceptions';
import { ClienteMapper } from './mappers/cliente.mapper';
import { Prisma, clientes_tipo_cliente } from '@prisma/client';
import { OptionDto } from '../../dtos/options.response.dto';

@Injectable()
export class ClientePrismaRepository implements ClienteRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    filter: GetClientesFilterDto,
  ): Promise<PaginatedClientesResult> {
    const { page = 1, limit = 10, search, tipo_cliente, is_active } = filter;

    const where: Prisma.clientesWhereInput = {};

    if (search) {
      where.OR = [
        { nombre_principal: { contains: search } },
        { numero_documento: { contains: search } },
        { correo: { contains: search } },
      ];
    }

    if (tipo_cliente !== undefined) {
      where.tipo_cliente = tipo_cliente as unknown as clientes_tipo_cliente;
    }

    if (is_active !== undefined) {
      where.is_active = is_active;
    }

    const skip = (page - 1) * limit;

    const [entities, total] = await Promise.all([
      this.prisma.clientes.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          planes: { select: { id_plan: true, tipo: true } },
          _count: { select: { sucursales: true } },
        },
      }),
      this.prisma.clientes.count({ where }),
    ]);

    return {
      data: entities.map(ClienteMapper.toListItem),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: number): Promise<ClienteDetail | null> {
    const entity = await this.prisma.clientes.findUnique({
      where: { id_cliente: id },
      include: { planes: true, sucursales: true },
    });
    if (!entity) return null;
    return ClienteMapper.toDetail(entity);
  }

  async existsByDocumento(numero_documento: string): Promise<boolean> {
    const count = await this.prisma.clientes.count({
      where: { numero_documento },
    });
    return count > 0;
  }

  async create(
    cliente: Cliente,
    sucursales: NuevoClienteSucursalesInput,
  ): Promise<Cliente> {
    const data = ClienteMapper.toPersistence(cliente);

    // Atomicidad: si falla la creación de cualquier sucursal, se revierte
    // también la creación del cliente.
    const created = await this.prisma.$transaction(async (tx) => {
      const clienteCreado = await tx.clientes.create({
        data: data as Prisma.clientesCreateInput,
      });

      // Sucursal principal: siempre se crea junto con el cliente
      await tx.sucursales.create({
        data: {
          ...sucursales.principal,
          id_cliente: clienteCreado.id_cliente,
          is_active: true,
          is_principal: true,
        },
      });

      // Sucursales adicionales: opcionales
      if (sucursales.adicionales.length > 0) {
        await tx.sucursales.createMany({
          data: sucursales.adicionales.map((sucursal) => ({
            ...sucursal,
            id_cliente: clienteCreado.id_cliente,
            is_active: true,
            is_principal: false,
          })),
        });
      }

      return clienteCreado;
    });

    return ClienteMapper.toDomain(created);
  }

  async update(
    id: number,
    cliente: Cliente,
    sucursales?: ActualizarClienteSucursalesInput,
  ): Promise<ClienteDetail> {
    const exists = await this.prisma.clientes.findUnique({
      where: { id_cliente: id },
    });
    if (!exists) throw new ClienteNotFoundException();

    // El id de ruta manda: se descarta cualquier id_cliente que venga en el payload
    const { id_cliente: _ignored, ...data } =
      ClienteMapper.toPersistence(cliente);

    await this.prisma.$transaction(async (tx) => {
      const clienteActualizado = await tx.clientes.update({
        where: { id_cliente: id },
        data,
      });

      if (sucursales?.principal) {
        const principalExistente = await tx.sucursales.findFirst({
          where: { id_cliente: id, is_principal: true },
        });

        if (principalExistente) {
          // Merge parcial: Prisma ignora las claves ausentes/undefined
          await tx.sucursales.update({
            where: { id_sucursal: principalExistente.id_sucursal },
            data: { ...sucursales.principal },
          });
        } else {
          // Cliente legado sin sucursal principal marcada: se crea una nueva
          await tx.sucursales.create({
            data: {
              nombre_sucursal:
                sucursales.principal.nombre_sucursal ??
                clienteActualizado.nombre_principal,
              encargado: sucursales.principal.encargado ?? '',
              telefono: sucursales.principal.telefono ?? '',
              correo: sucursales.principal.correo ?? '',
              direccion: sucursales.principal.direccion ?? '',
              id_cliente: id,
              is_active: true,
              is_principal: true,
            },
          });
        }
      }

      if (sucursales?.adicionales?.length) {
        await tx.sucursales.createMany({
          data: sucursales.adicionales.map((sucursal) => ({
            ...sucursal,
            id_cliente: id,
            is_active: true,
            is_principal: false,
          })),
        });
      }

      return clienteActualizado;
    });

    const entityConRelaciones = await this.prisma.clientes.findUnique({
      where: { id_cliente: id },
      include: { planes: true, sucursales: true },
    });

    if (!entityConRelaciones) {
      throw new ClienteNotFoundException();
    }

    return ClienteMapper.toDetail(entityConRelaciones);
  }

  async toggleStatus(id: number): Promise<Cliente> {
    const current = await this.prisma.clientes.findUnique({
      where: { id_cliente: id },
    });
    if (!current) throw new ClienteNotFoundException();

    const updated = await this.prisma.clientes.update({
      where: { id_cliente: id },
      data: { is_active: !current.is_active },
    });
    return ClienteMapper.toDomain(updated);
  }

  async getClientesOptions(): Promise<OptionDto[]> {
    const clientes = await this.prisma.clientes.findMany({
      select: {
        id_cliente: true,
        nombre_principal: true,
      },
    });
    return clientes.map((c) => ({
      id: c.id_cliente,
      nombre: c.nombre_principal,
    }));
  }
}