import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/infrastructure/prisma/prisma.service';
import {
  EquipoRepositoryPort,
  PaginatedEquiposResult,
} from '@/equipos/domain/ports/equipo.repository.port';
import {
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
import { RegistrarInstalarComponenteData } from '@/equipos/domain/dto/registrar-instalar-componente-data.dto';
import { RegistrarEReemplazarComponenteData } from '@/equipos/domain/dto/registrar-reemplazar-componente-data.dto';
import { EstadoHardware } from '@/hardware/domain/enums/estado-hardware.enum';
import {
  ComponenteHardwareNotFoundException,
  ComponenteNoDisponibleException,
  ComponenteNoInstaladoException,
  EquipoNotFoundException,
  NumeroSerieComponenteDuplicadoException,
  TecnicoResponsableNoDisponibleException,
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

  // Alterna is_active y mantiene coherentes `estado` e `id_trabajador`:
  // - Desactivar (true -> false): estado "Retirado" y sin trabajador, porque un
  //   equipo retirado no puede seguir en custodia.
  // - Reactivar (false -> true): estado "En_Almacen" y sin trabajador (ya
  //   desvinculado al retirarlo), disponible para PATCH /equipos/:id/asignar.
  // Prisma no permite `SET is_active = NOT is_active` sin SQL crudo, así que se
  // lee el valor actual (solo esa columna) y se escribe el contrario junto con
  // el resto de columnas en un único UPDATE. `is_active` es nullable en el
  // schema y el mapper trata null como activo, por eso aquí también (null pasa
  // a desactivado). `updated_at` se fija a mano: la columna no se actualiza sola.
  async toggleEstado(id: number): Promise<Equipo> {
    const current = await this.prisma.equipos.findUnique({
      where: { id_equipo: id },
      select: { is_active: true },
    });
    if (!current) throw new EquipoNotFoundException();

    const seDesactiva = current.is_active ?? true;

    try {
      const updated = await this.prisma.equipos.update({
        where: { id_equipo: id },
        data: {
          is_active: !seDesactiva,
          estado: seDesactiva
            ? EstadoEquipo.RETIRADO
            : EstadoEquipo.EN_ALMACEN,
          id_trabajador: null,
          updated_at: new Date(),
        },
      });
      return EquipoMapper.toDomain(updated);
    } catch (error) {
      // P2025: el equipo se eliminó entre la lectura y la escritura.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new EquipoNotFoundException();
      }
      throw error;
    }
  }

  // Libera el equipo: sin custodio y en almacén.
  async release(id: number): Promise<void> {
    await this.updateAsignacion(id, {
      id_trabajador: null,
      estado: EstadoEquipo.EN_ALMACEN,
    });
  }

  // Asigna el equipo al trabajador indicado y lo deja activo. Las
  // observaciones solo se escriben si vienen informadas.
  async assign(
    id: number,
    idTrabajador: number,
    observaciones?: string,
  ): Promise<void> {
    await this.updateAsignacion(id, {
      id_trabajador: idTrabajador,
      estado: EstadoEquipo.ACTIVO,
      ...(observaciones !== undefined && { observaciones }),
    });
  }

  // Un único UPDATE (sin lectura previa, así no hay ventana de carrera).
  // `updated_at` se fija a mano: la columna no se actualiza sola.
  private async updateAsignacion(
    id: number,
    cambios: {
      id_trabajador: number | null;
      estado: EstadoEquipo;
      observaciones?: string;
    },
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

  // Monta un componente de stock. Todo ocurre en una transacción: si falla el
  // movimiento (p. ej. el técnico no existe) el hardware vuelve a "Disponible".
  async montarComponenteStock(
    idEquipo: number,
    idHardware: number,
    fechaInstalacion: Date,
    observaciones?: string,
    idTecnico?: number,
  ): Promise<void> {
    try {
      await this.prisma.$transaction(async (tx) => {
        await this.asegurarEquipoExiste(tx, idEquipo);
        await this.instalarDesdeStock(
          tx,
          idEquipo,
          idHardware,
          fechaInstalacion,
          observaciones,
          idTecnico,
        );
      });
    } catch (error) {
      throw this.translateComponenteError(error);
    }
  }

  // Registra un componente nuevo y lo instala. `hardware.numero_serie` no
  // tiene índice único en el schema, por eso la duplicidad se valida dentro de
  // la transacción (y P2002 se traduce igual por si el índice se agrega).
  async registrarEInstalarComponente(
    idEquipo: number,
    data: RegistrarInstalarComponenteData,
  ): Promise<void> {
    try {
      await this.prisma.$transaction(async (tx) => {
        await this.asegurarEquipoExiste(tx, idEquipo);
        await this.crearEInstalarComponente(tx, idEquipo, data);
      });
    } catch (error) {
      throw this.translateComponenteError(error);
    }
  }

  // Reemplazo con pieza de stock: retira el componente actual y monta el
  // componente disponible, todo en una transacción. El orden importa para
  // devolver siempre el primer error lógico (equipo, componente actual y, por
  // último, componente nuevo); cualquier fallo revierte también el retiro.
  async reemplazarComponenteStock(
    idEquipo: number,
    idHardwareActual: number,
    idHardwareNuevo: number,
    fechaReemplazo: Date,
    observaciones?: string,
    idTecnico?: number,
  ): Promise<void> {
    try {
      await this.prisma.$transaction(async (tx) => {
        await this.asegurarEquipoExiste(tx, idEquipo);
        await this.retirarComponenteActual(
          tx,
          idEquipo,
          idHardwareActual,
          fechaReemplazo,
          observaciones,
        );
        await this.instalarDesdeStock(
          tx,
          idEquipo,
          idHardwareNuevo,
          fechaReemplazo,
          observaciones,
          idTecnico,
        );
      });
    } catch (error) {
      throw this.translateComponenteError(error);
    }
  }

  // Reemplazo registrando la pieza nueva: retira el componente actual y crea
  // el nuevo ya instalado, todo en una transacción.
  async registrarEReemplazarComponente(
    idEquipo: number,
    idHardwareActual: number,
    data: RegistrarEReemplazarComponenteData,
  ): Promise<void> {
    try {
      await this.prisma.$transaction(async (tx) => {
        await this.asegurarEquipoExiste(tx, idEquipo);
        await this.retirarComponenteActual(
          tx,
          idEquipo,
          idHardwareActual,
          data.fechaReemplazo,
          data.observaciones,
        );
        await this.crearEInstalarComponente(tx, idEquipo, {
          tipoComponente: data.tipoComponente,
          marcaModelo: data.marcaModelo,
          numeroSerie: data.numeroSerie,
          proveedor: data.proveedor,
          fechaCompra: data.fechaCompra,
          urlFactura: data.urlFactura,
          fechaInstalacion: data.fechaReemplazo,
          observaciones: data.observaciones,
          idTecnico: data.idTecnico,
        });
      });
    } catch (error) {
      throw this.translateComponenteError(error);
    }
  }

  private async asegurarEquipoExiste(
    tx: Prisma.TransactionClient,
    idEquipo: number,
  ): Promise<void> {
    const existe = await tx.equipos.count({ where: { id_equipo: idEquipo } });
    if (!existe) throw new EquipoNotFoundException();
  }

  // Instala en el equipo un componente en stock con reserva atómica: solo se
  // instala si sigue Disponible y sin equipo, así dos operaciones simultáneas
  // no pueden tomar la misma pieza. Debe llamarse dentro de una transacción.
  private async instalarDesdeStock(
    tx: Prisma.TransactionClient,
    idEquipo: number,
    idHardware: number,
    fechaInstalacion: Date,
    observaciones?: string,
    idTecnico?: number,
  ): Promise<void> {
    const { count } = await tx.hardware.updateMany({
      where: {
        id_hardware: idHardware,
        estado: EstadoHardware.DISPONIBLE,
        id_equipo_actual: null,
      },
      data: {
        estado: EstadoHardware.INSTALADO,
        id_equipo_actual: idEquipo,
        updated_at: new Date(),
      },
    });

    if (count === 0) {
      // No se reservó: o no existe o no estaba disponible.
      const existe = await tx.hardware.count({
        where: { id_hardware: idHardware },
      });
      throw existe
        ? new ComponenteNoDisponibleException()
        : new ComponenteHardwareNotFoundException();
    }

    await tx.registro_hardware.create({
      data: {
        id_equipo: idEquipo,
        id_hardware: idHardware,
        is_actual: true,
        fecha_instalacion: fechaInstalacion,
        motivo_instalacion: observaciones ?? null,
        id_tecnico_resp: idTecnico ?? null,
      },
    });
  }

  // Crea un componente nuevo ya instalado en el equipo, con su movimiento
  // actual. Debe llamarse dentro de una transacción.
  private async crearEInstalarComponente(
    tx: Prisma.TransactionClient,
    idEquipo: number,
    data: RegistrarInstalarComponenteData,
  ): Promise<void> {
    const duplicado = await tx.hardware.count({
      where: { numero_serie: data.numeroSerie },
    });
    if (duplicado > 0) throw new NumeroSerieComponenteDuplicadoException();

    const nuevo = await tx.hardware.create({
      data: {
        tipo_componente: data.tipoComponente,
        marca_modelo: data.marcaModelo,
        numero_serie: data.numeroSerie,
        proveedor: data.proveedor ?? null,
        fecha_compra: data.fechaCompra ?? null,
        url_factura: data.urlFactura ?? null,
        estado: EstadoHardware.INSTALADO,
        id_equipo_actual: idEquipo,
      },
      select: { id_hardware: true },
    });

    await tx.registro_hardware.create({
      data: {
        id_equipo: idEquipo,
        id_hardware: nuevo.id_hardware,
        is_actual: true,
        fecha_instalacion: data.fechaInstalacion,
        motivo_instalacion: data.observaciones ?? null,
        id_tecnico_resp: data.idTecnico ?? null,
      },
    });
  }

  // Retira del equipo el componente actual: pasa a "Baja / Descarte", queda
  // sin equipo y se cierra su movimiento activo. La baja es condicional a que
  // siga instalado en este equipo (updateMany), de modo que sirve a la vez de
  // verificación y de bloqueo frente a retiros concurrentes. Si el componente
  // no existe o está instalado en otro equipo se lanza
  // ComponenteNoInstaladoException. Si por datos previos inconsistentes no
  // hubiera movimiento activo que cerrar, no se falla: la baja ya dejó el
  // componente sin equipo, que es el estado buscado. Debe llamarse dentro de
  // una transacción.
  private async retirarComponenteActual(
    tx: Prisma.TransactionClient,
    idEquipo: number,
    idHardwareActual: number,
    fechaRetiro: Date,
    motivoRetiro?: string,
  ): Promise<void> {
    const { count } = await tx.hardware.updateMany({
      where: { id_hardware: idHardwareActual, id_equipo_actual: idEquipo },
      data: {
        estado: EstadoHardware.BAJA,
        id_equipo_actual: null,
        updated_at: new Date(),
      },
    });
    if (count === 0) throw new ComponenteNoInstaladoException();

    await tx.registro_hardware.updateMany({
      where: {
        id_equipo: idEquipo,
        id_hardware: idHardwareActual,
        is_actual: true,
      },
      data: {
        is_actual: false,
        fecha_retiro: fechaRetiro,
        motivo_retiro: motivoRetiro ?? null,
        updated_at: new Date(),
      },
    });
  }

  // Traduce los errores de Prisma del montaje y reemplazo de componentes. Las
  // operaciones usan create/updateMany/count (nunca update por clave única),
  // así que P2025 no se produce; los borrados concurrentes llegan como P2003 y se distinguen
  // por el nombre de la FK (fk_rh_tecnico, fk_rh_equipo, fk_hw_equipo_actual,
  // fk_rh_hardware).
  // - P2002: número de serie duplicado (si existe índice único).
  // - P2003: el técnico, el equipo o el hardware dejó de existir.
  private translateComponenteError(error: unknown): unknown {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return new NumeroSerieComponenteDuplicadoException();
      }
      if (error.code === 'P2003') {
        const fk = String(error.meta?.field_name ?? '');
        if (fk.includes('tecnico')) {
          return new TecnicoResponsableNoDisponibleException();
        }
        if (fk.includes('equipo')) return new EquipoNotFoundException();
        if (fk.includes('hardware')) {
          return new ComponenteHardwareNotFoundException();
        }
      }
    }
    return error;
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

<<<<<<< HEAD
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
          motivo_retiro: dto.descripcion,
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
          motivo_retiro: dto.descripcion,
        },
        include: { hardware: true, tecnico_responsable: true },
      });
      return EquipoMapper.toComponenteHardware(nuevo);
    });
  }

  async getEquipoOptions(
    id_area?: number,
    id_trabajador?: number,
  ): Promise<{ id_equipo: number; nombre_equipo: string }[]> {
    const where: Prisma.equiposWhereInput = {};
    if (id_area !== undefined) where.id_area = id_area;
    if (id_trabajador !== undefined) where.id_trabajador = id_trabajador;
    const equipos = await this.prisma.equipos.findMany({
      where,
      select: { id_equipo: true, nombre_equipo: true },
    });
    return equipos.map((equipo) => ({
      id_equipo: equipo.id_equipo,
      nombre_equipo: equipo.nombre_equipo ?? '',
    }));
=======
    return { total_equipos, asignados, sin_asignar };
>>>>>>> origin/giovanni
  }
}
