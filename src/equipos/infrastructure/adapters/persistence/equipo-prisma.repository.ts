import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/infrastructure/prisma/prisma.service';
import {
  EquipoRepositoryPort,
  PaginatedEquiposResult,
} from '@/equipos/domain/ports/equipo.repository.port';
import {
  ComponenteHardware,
  Equipo,
  EquipoCreadoItem,
  EquipoDetail,
  EquipoEstadisticas,
  EquipoOptionItem,
} from '@/equipos/domain/entities/equipo.entity';
import { GetEquiposFilterDto } from '@/equipos/domain/dto/get-equipos-filter.dto';
import { GetEquipoOptionsFilterDto } from '@/equipos/domain/dto/get-equipo-options-filter.dto';
import { AsignacionEquipo } from '@/equipos/domain/enums/asignacion-equipo.enum';
import { EstadoEquipo } from '@/equipos/domain/enums/estado-equipo.enum';
import { CreateEquipoData } from '@/equipos/domain/dto/create-equipo-data.dto';
import { AgregarComponenteDto } from '@/equipos/domain/dto/agregar-componente.dto';
import { ReemplazarComponenteDto } from '@/equipos/domain/dto/reemplazar-componente.dto';
import {
  ComponenteHardwareNotFoundException,
  ComponenteNoInstaladoException,
  EquipoNotFoundException,
  TrabajadorEquipoNoDisponibleException,
} from '@/equipos/domain/exceptions/equipo.exceptions';
import { EquipoMapper } from './mappers/equipo.mapper';
import { Prisma } from '@prisma/client';

const INCLUDE_RESUMEN = {
  clientes: { select: { id_cliente: true, nombre_principal: true } },
  sucursales: { select: { id_sucursal: true, nombre_sucursal: true } },
  area: { select: { id_area: true, nombre_area: true } },
  usuarios: {
    select: { id_usuario: true, nombre: true, apellido: true, correo: true },
  },
} satisfies Prisma.equiposInclude;

const INCLUDE_DETALLE = {
  clientes: { select: { id_cliente: true, nombre_principal: true } },
  sucursales: {
    select: {
      id_sucursal: true,
      nombre_sucursal: true,
      direccion: true,
      encargado: true,
    },
  },
  area: { select: { id_area: true, nombre_area: true } },
  usuarios: {
    select: {
      id_usuario: true,
      nombre: true,
      apellido: true,
      correo: true,
      telefono: true,
    },
  },
  registro_hardware: {
    include: {
      hardware: true,
      tecnico_responsable: {
        select: { id_usuario: true, nombre: true, apellido: true },
      },
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
      estado,
      asignacion,
      id_cliente,
      id_sucursal,
      id_area,
    } = filters;

    // En MySQL `contains` ya ignora mayúsculas según la collation (`mode` no
    // es soportado).
    const where: Prisma.equiposWhereInput = {
      ...(id_cliente !== undefined && { id_cliente }),
      ...(id_sucursal !== undefined && { id_sucursal }),
      ...(id_area !== undefined && { id_area }),
      ...(estado && { estado }),
      ...(asignacion && {
        id_trabajador:
          asignacion === AsignacionEquipo.ASIGNADOS ? { not: null } : null,
      }),
      ...(search && {
        OR: [
          { nombre_equipo: { contains: search } },
          { num_serie: { contains: search } },
          { marca_modelo: { contains: search } },
          {
            usuarios: {
              OR: [
                { nombre: { contains: search } },
                { apellido: { contains: search } },
              ],
            },
          },
        ],
      }),
    };

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
      data: entities.map(EquipoMapper.toListadoItem),
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

  async create(data: CreateEquipoData): Promise<EquipoCreadoItem> {
    const created = await this.prisma.equipos.create({
      data: {
        nombre_equipo: data.nombre_equipo,
        num_serie: data.num_serie,
        tipo: data.tipo,
        marca_modelo: data.marca_modelo,
        estado: data.estado,
        id_cliente: data.id_cliente,
        id_sucursal: data.id_sucursal,
        id_area: data.id_area,
        id_trabajador: data.id_trabajador ?? null,
        is_active: data.is_active,
      },
      include: INCLUDE_RESUMEN,
    });
    return EquipoMapper.toCreadoItem(created);
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

  // Libera el equipo: sin custodio y en almacén.
  async release(id: number): Promise<void> {
    await this.updateAsignacion(id, {
      id_trabajador: null,
      estado: EstadoEquipo.EN_ALMACEN,
    });
  }

  // Asigna el equipo al trabajador indicado y lo deja activo.
  async assign(id: number, idTrabajador: number): Promise<void> {
    await this.updateAsignacion(id, {
      id_trabajador: idTrabajador,
      estado: EstadoEquipo.ACTIVO,
    });
  }

  // Un único UPDATE (sin lectura previa, así no hay ventana de carrera).
  // `updated_at` se fija a mano: la columna no se actualiza sola.
  private async updateAsignacion(
    id: number,
    cambios: { id_trabajador: number | null; estado: EstadoEquipo },
  ): Promise<void> {
    try {
      await this.prisma.equipos.update({
        where: { id_equipo: id },
        data: { ...cambios, updated_at: new Date() },
      });
    } catch (error) {
      throw this.translateAsignacionError(error);
    }
  }

  // - P2025: no existe el equipo a actualizar.
  // - P2003: viola una clave foránea; aquí solo puede ser el trabajador
  //   (fk_eqipos_trabajador), que no existe.
  private translateAsignacionError(error: unknown): unknown {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') return new EquipoNotFoundException();
      if (
        error.code === 'P2003' &&
        String(error.meta?.field_name ?? '').includes('trabajador')
      ) {
        return new TrabajadorEquipoNoDisponibleException();
      }
    }
    return error;
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
      this.prisma.hardware.findUnique({
        where: { id_hardware: dto.id_hardware },
      }),
    ]);
    if (!equipo) throw new EquipoNotFoundException();
    if (!hardware) throw new ComponenteHardwareNotFoundException();

    return this.prisma.$transaction(async (tx) => {
      await tx.hardware.update({
        where: { id_hardware: dto.id_hardware },
        data: {
          estado: 'INSTALADO',
          id_equipo_actual: id_equipo,
        },
      });

      const registro = await tx.registro_hardware.create({
        data: {
          id_equipo,
          id_hardware: dto.id_hardware,
          is_actual: true,
          fecha_instalacion: new Date(),
          motivo_instalacion: dto.descripcion,
        },
        include: { hardware: true, tecnico_responsable: true },
      });
      return EquipoMapper.toComponenteHardware(registro);
    });
  }

  async reemplazarComponente(
    id_equipo: number,
    dto: ReemplazarComponenteDto,
  ): Promise<ComponenteHardware> {
    return this.prisma.$transaction(async (tx) => {
      const equipo = await tx.equipos.count({ where: { id_equipo } });
      if (!equipo) throw new EquipoNotFoundException();

      const hardwareNuevo = await tx.hardware.findUnique({
        where: { id_hardware: dto.id_hardware_nuevo },
      });
      if (!hardwareNuevo) throw new ComponenteHardwareNotFoundException();

      const saliente = await tx.registro_hardware.findUnique({
        where: { id_RH: dto.id_RH_saliente, id_equipo, is_actual: true },
        select: { id_RH: true, id_hardware: true },
      });
      if (!saliente) throw new ComponenteNoInstaladoException();

      await tx.registro_hardware.update({
        where: { id_RH: saliente.id_RH },
        data: {
          is_actual: false,
          fecha_retiro: new Date(),
          updated_at: new Date(),
        },
      });

      await tx.hardware.update({
        where: { id_hardware: saliente.id_hardware },
        data: { estado: 'DISPONIBLE', id_equipo_actual: null },
      });

      await tx.hardware.update({
        where: { id_hardware: dto.id_hardware_nuevo },
        data: { estado: 'INSTALADO', id_equipo_actual: id_equipo },
      });

      const nuevo = await tx.registro_hardware.create({
        data: {
          id_equipo,
          id_hardware: dto.id_hardware_nuevo,
          is_actual: true,
          fecha_instalacion: new Date(),
          motivo_instalacion: dto.descripcion,
        },
        include: { hardware: true, tecnico_responsable: true },
      });
      return EquipoMapper.toComponenteHardware(nuevo);
    });
  }

  // Opciones para selectores: solo equipos activos (los dados de baja no se
  // listan), filtros opcionales combinables y solo las columnas necesarias.
  // En MySQL `contains` ya ignora mayúsculas según la collation.
  async getEquipoOptions(
    filters: GetEquipoOptionsFilterDto = {},
  ): Promise<EquipoOptionItem[]> {
    const { id_cliente, id_sucursal, id_area, estado, search } = filters;

    const where: Prisma.equiposWhereInput = {
      is_active: true,
      ...(id_cliente !== undefined && { id_cliente }),
      ...(id_sucursal !== undefined && { id_sucursal }),
      ...(id_area !== undefined && { id_area }),
      ...(estado && { estado }),
      ...(search && {
        OR: [
          { nombre_equipo: { contains: search } },
          { num_serie: { contains: search } },
          { marca_modelo: { contains: search } },
        ],
      }),
    };

    const equipos = await this.prisma.equipos.findMany({
      where,
      select: {
        id_equipo: true,
        nombre_equipo: true,
        num_serie: true,
        tipo: true,
        marca_modelo: true,
        estado: true,
      },
      // id_equipo desempata nombres repetidos (o sin nombre) para que el
      // orden sea estable.
      orderBy: [{ nombre_equipo: 'asc' }, { id_equipo: 'asc' }],
    });

    return equipos.map(EquipoMapper.toOptionItem);
  }

  // KPI del inventario: solo equipos activos. Las tres consultas son
  // independientes y se ejecutan en paralelo.
  async getEstadisticas(): Promise<EquipoEstadisticas> {
    const [total_equipos, asignados, sin_asignar] = await Promise.all([
      this.prisma.equipos.count({ where: { is_active: true } }),
      this.prisma.equipos.count({
        where: { is_active: true, id_trabajador: { not: null } },
      }),
      this.prisma.equipos.count({
        where: { is_active: true, id_trabajador: null },
      }),
    ]);

    return { total_equipos, asignados, sin_asignar };
  }
}
