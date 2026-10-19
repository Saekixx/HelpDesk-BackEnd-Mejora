import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/infrastructure/prisma/prisma.service';
import {
  EquipoRepositoryPort,
  PaginatedEquiposResult,
} from '@/equipos/domain/ports/equipo.repository.port';
import {
  ComponenteHardware,
  Equipo,
  EquipoDetail,
  EquipoListItem,
} from '@/equipos/domain/entities/equipo.entity';
import { GetEquiposFilterDto } from '@/equipos/domain/dto/get-equipos-filter.dto';
import { CreateEquipoDto } from '@/equipos/domain/dto/create-equipo.dto';
import { UpdateEquipoDto } from '@/equipos/domain/dto/update-equipo.dto';
import { AgregarComponenteDto } from '@/equipos/domain/dto/agregar-componente.dto';
import { ReemplazarComponenteDto } from '@/equipos/domain/dto/reemplazar-componente.dto';
import {
  ComponenteHardwareNotFoundException,
  ComponenteNoInstaladoException,
  EquipoNotFoundException,
} from '@/equipos/domain/exceptions/equipo.exceptions';
import { EquipoMapper } from './mappers/equipo.mapper';
import { Prisma } from '@prisma/client';

const INCLUDE_RESUMEN = {
  clientes: { select: { id_cliente: true, nombre_principal: true } },
  sucursales: { select: { id_sucursal: true, nombre_sucursal: true } },
  area: { select: { id_area: true, nombre_area: true } },
  usuarios: { select: { id_usuario: true, nombre: true, apellido: true } },
} satisfies Prisma.equiposInclude;

const INCLUDE_DETALLE = {
  ...INCLUDE_RESUMEN,
  registro_hardware: {
    include: {
      hardware: true,
    },
    orderBy: { fecha_instalacion: 'desc' },
  },
  software_equipos: {
    include: {
      software: true,
    },
    orderBy: {
      fecha_instalacion: 'desc',
    },
  },
} satisfies Prisma.equiposInclude;

// Una FK solo se conecta si es un entero válido (> 0). null, undefined o 0 se
// omiten para no enviar `connect: { id: null }`, que Prisma rechaza.
const isValidId = (id?: number | null): id is number =>
  typeof id === 'number' && Number.isInteger(id) && id > 0;

export type PrismaEquipoDetalleCompleto = Prisma.equiposGetPayload<{
  include: typeof INCLUDE_DETALLE;
}>;

@Injectable()
export class EquipoPrismaRepository implements EquipoRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: GetEquiposFilterDto): Promise<PaginatedEquiposResult> {
    const {
      page = 1,
      limit = 10,
      search,
      is_active,
      id_cliente,
      id_sucursal,
    } = filters;

    const where: Prisma.equiposWhereInput = {};

    if (id_cliente !== undefined) where.id_cliente = id_cliente;
    if (id_sucursal !== undefined) where.id_sucursal = id_sucursal;
    if (is_active !== undefined) where.is_active = is_active;

    if (search) {
      where.OR = [
        { tipo: { contains: search } },
        { marca: { contains: search } },
        { num_serie: { contains: search } },
      ];
    }

    const skip = (page - 1) * limit;

    const [entities, total] = await Promise.all([
      this.prisma.equipos.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: INCLUDE_RESUMEN,
      }),
      this.prisma.equipos.count({ where }),
    ]);

    return {
      data: entities.map(EquipoMapper.toListItem),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: number): Promise<Equipo | null> {
    const entity = await this.prisma.equipos.findUnique({
      where: { id_equipo: id },
    });
    if (!entity) return null;
    return EquipoMapper.toDomain(entity);
  }

  async findDetailById(id: number): Promise<EquipoDetail | null> {
    const entity = await this.prisma.equipos.findUnique({
      where: { id_equipo: id },
      include: INCLUDE_DETALLE,
    });
    if (!entity) return null;
    return EquipoMapper.toDetail(entity);
  }

  async create(data: CreateEquipoDto): Promise<EquipoListItem> {
    const created = await this.prisma.equipos.create({
      data: {
        tipo: data.tipo,
        marca: data.marca,
        nombre_equipo: data.nombre_equipo,
        num_serie: data.num_serie,
        nombre_usuario: data.nombre_usuario,
        ult_revision: data.ult_revision,
        rev_programada: data.rev_programada,
        is_active: data.is_active ?? true,
        ...(isValidId(data.id_trabajador) && {
          usuarios: { connect: { id_usuario: data.id_trabajador } },
        }),
        ...(isValidId(data.id_cliente) && {
          clientes: { connect: { id_cliente: data.id_cliente } },
        }),
        ...(isValidId(data.id_sucursal) && {
          sucursales: { connect: { id_sucursal: data.id_sucursal } },
        }),
        ...(isValidId(data.id_area) && {
          area: { connect: { id_area: data.id_area } },
        }),
      },
      include: INCLUDE_RESUMEN,
    });
    return EquipoMapper.toListItem(created);
  }

  async update(id: number, data: UpdateEquipoDto): Promise<EquipoListItem> {
    const exists = await this.prisma.equipos.findUnique({
      where: { id_equipo: id },
    });
    if (!exists) throw new EquipoNotFoundException();

    const updated = await this.prisma.equipos.update({
      where: { id_equipo: id },
      data: {
        ...(data.tipo !== undefined && { tipo: data.tipo }),
        ...(data.marca !== undefined && { marca: data.marca }),
        ...(data.nombre_equipo !== undefined && {
          nombre_equipo: data.nombre_equipo,
        }),
        ...(data.num_serie !== undefined && { num_serie: data.num_serie }),
        ...(data.nombre_usuario !== undefined && {
          nombre_usuario: data.nombre_usuario,
        }),
        ...(data.ult_revision !== undefined && {
          ult_revision: data.ult_revision,
        }),
        ...(data.rev_programada !== undefined && {
          rev_programada: data.rev_programada,
        }),
        // id_trabajador/id_cliente/id_sucursal/id_area son FKs opcionales:
        // un valor truthy conecta la relación, 0/null la desconecta.
        ...(data.id_trabajador !== undefined && {
          usuarios: data.id_trabajador
            ? { connect: { id_usuario: data.id_trabajador } }
            : { disconnect: true },
        }),
        ...(data.id_cliente !== undefined && {
          clientes: data.id_cliente
            ? { connect: { id_cliente: data.id_cliente } }
            : { disconnect: true },
        }),
        ...(data.id_sucursal !== undefined && {
          sucursales: data.id_sucursal
            ? { connect: { id_sucursal: data.id_sucursal } }
            : { disconnect: true },
        }),
        ...(data.id_area !== undefined && {
          area: data.id_area
            ? { connect: { id_area: data.id_area } }
            : { disconnect: true },
        }),
      },
      include: INCLUDE_RESUMEN,
    });
    return EquipoMapper.toListItem(updated);
  }

  async toggleStatus(id: number): Promise<Equipo> {
    const current = await this.prisma.equipos.findUnique({
      where: { id_equipo: id },
    });
    if (!current) throw new EquipoNotFoundException();

    const updated = await this.prisma.equipos.update({
      where: { id_equipo: id },
      data: { is_active: !current.is_active },
    });
    return EquipoMapper.toDomain(updated);
  }

  async existsByNumSerie(num_serie: string): Promise<boolean> {
    const count = await this.prisma.equipos.count({ where: { num_serie } });
    return count > 0;
  }

  async isEquipoOwnedByUsuario(
    idEquipo: number,
    idTrabajador: number,
  ): Promise<boolean> {
    const count = await this.prisma.equipos.count({
      where: {
        id_equipo: Number(idEquipo),
        id_trabajador: Number(idTrabajador),
      },
    });

    return count > 0;
  }

  async agregarComponente(
    id_equipo: number,
    dto: AgregarComponenteDto,
  ): Promise<ComponenteHardware> {
    const [equipo, hardware] = await Promise.all([
      this.prisma.equipos.count({ where: { id_equipo } }),
      this.prisma.hardware.count({ where: { id_hardware: dto.id_hardware } }),
    ]);
    if (!equipo) throw new EquipoNotFoundException();
    if (!hardware) throw new ComponenteHardwareNotFoundException();

    const registro = await this.prisma.registro_hardware.create({
      data: {
        id_equipo,
        id_hardware: dto.id_hardware,
        serie: dto.serie,
        proveedor: dto.proveedor,
        descripcion: dto.descripcion,
        is_actual: true,
        fecha_instalacion: new Date(),
      },
      include: { hardware: true },
    });
    return EquipoMapper.toComponenteHardware(registro);
  }

  async reemplazarComponente(
    id_equipo: number,
    dto: ReemplazarComponenteDto,
  ): Promise<ComponenteHardware> {
    // Todo ocurre en una sola transacción: si falla la creación del nuevo
    // registro, el saliente no queda marcado como histórico.
    return this.prisma.$transaction(async (tx) => {
      const equipo = await tx.equipos.count({ where: { id_equipo } });
      if (!equipo) throw new EquipoNotFoundException();

      const hardwareNuevo = await tx.hardware.count({
        where: { id_hardware: dto.id_hardware_nuevo },
      });
      if (!hardwareNuevo) throw new ComponenteHardwareNotFoundException();

      // Búsqueda directa por la PK; id_equipo e is_actual garantizan que el
      // registro pertenezca a este equipo y siga instalado.
      const saliente = await tx.registro_hardware.findUnique({
        where: { id_RH: dto.id_RH_saliente, id_equipo, is_actual: true },
        select: { id_RH: true },
      });
      if (!saliente) throw new ComponenteNoInstaladoException();

      await tx.registro_hardware.update({
        where: { id_RH: saliente.id_RH },
        data: { is_actual: false, updated_at: new Date() },
      });

      const nuevo = await tx.registro_hardware.create({
        data: {
          id_equipo,
          id_hardware: dto.id_hardware_nuevo,
          serie: dto.serie,
          proveedor: dto.proveedor,
          descripcion: dto.descripcion,
          is_actual: true,
          fecha_instalacion: new Date(),
        },
        include: { hardware: true },
      });
      return EquipoMapper.toComponenteHardware(nuevo);
    });
  }
}