import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/infrastructure/prisma/prisma.service';
import {
  HardwareRepositoryPort,
  TransitionHardwareParams,
} from '@/hardware/domain/ports/hardware.repository.port';
import { Hardware } from '@/hardware/domain/entities/hardware.entity';
import { HardwareMapper } from './mappers/hardware.mapper';
import { Prisma } from '@prisma/client';
import { FilterHardwareDto } from '@/hardware/application/dtos/filter-hardware.dto';
import { GetHardwareOptionsQueryDto } from '@/hardware/application/dtos/get-hardware-options.query.dto';
import { HardwareOptionResponseDto } from '@/hardware/application/dtos/hardware-option-response.dto';
import { EstadoHardware } from '@/hardware/domain/enums/estado-hardware.enum';
import {
  HardwareModificadoConcurrentementeException,
  HardwareNotFoundException,
} from '@/hardware/domain/exceptions/hardware.exceptions';
import {
  TIPO_COMPONENTE_LABEL,
  TipoComponente,
} from '@/hardware/domain/enums/tipo-componente.enum';

// Equipo asignado al hardware con su ubicación (cliente, sucursal, área).
const HARDWARE_INCLUDE = {
  equipo_actual: {
    select: {
      id_equipo: true,
      nombre_equipo: true,
      clientes: { select: { id_cliente: true, nombre_principal: true } },
      sucursales: { select: { id_sucursal: true, nombre_sucursal: true } },
      area: { select: { id_area: true, nombre_area: true } },
    },
  },
} satisfies Prisma.hardwareInclude;

// Detalle del hardware ("Hoja de Vida del Componente"): además del equipo
// actual con su ubicación, incluye el historial de movimientos
// (`registro_hardware`) con el equipo y el técnico responsable, del más
// reciente al más antiguo. `id_RH` desempata movimientos de la misma fecha
// (la instalación guarda la fecha con precisión de segundos).
const HARDWARE_DETALLE_INCLUDE = {
  ...HARDWARE_INCLUDE,
  registro_hardware: {
    orderBy: [{ fecha_instalacion: 'desc' }, { id_RH: 'desc' }],
    select: {
      id_RH: true,
      fecha_instalacion: true,
      fecha_retiro: true,
      motivo_retiro: true,
      is_actual: true,
      equipos: { select: { id_equipo: true, nombre_equipo: true } },
      tecnico_responsable: {
        select: { id_usuario: true, nombre: true, apellido: true },
      },
    },
  },
} satisfies Prisma.hardwareInclude;

@Injectable()
export class HardwarePrismaRepository implements HardwareRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(hardware: Hardware): Promise<Hardware> {
    const data = HardwareMapper.toPersistence(hardware);

    // Hardware y registro de instalación se crean juntos o no se crea nada.
    const created = await this.prisma.$transaction(async (tx) => {
      const nuevo = await tx.hardware.create({
        data,
        include: HARDWARE_INCLUDE,
      });

      if (nuevo.id_equipo_actual !== null) {
        await tx.registro_hardware.create({
          data: {
            id_hardware: nuevo.id_hardware,
            id_equipo: nuevo.id_equipo_actual,
            is_actual: true,
            fecha_instalacion: new Date(),
          },
        });
      }

      return nuevo;
    });

    return HardwareMapper.toDomain(created);
  }

  async update(hardware: Hardware): Promise<Hardware> {
    // Solo se actualiza hardware ya persistido: `id_hardware` está definido.
    const id_hardware = hardware.id_hardware as number;

    try {
      const updated = await this.prisma.hardware.update({
        where: { id_hardware },
        data: HardwareMapper.toPersistence(hardware),
      });
      return HardwareMapper.toDomain(updated);
    } catch (error) {
      // P2025: el registro dejó de existir entre la lectura y la escritura.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new HardwareNotFoundException(id_hardware);
      }
      throw error;
    }
  }

  async transition({
    anterior,
    nuevo,
    motivo,
    id_tecnico_resp,
  }: TransitionHardwareParams): Promise<Hardware> {
    // Solo se hacen transiciones de hardware ya persistido.
    const id_hardware = nuevo.id_hardware as number;
    // Misma marca de tiempo para el hardware y sus movimientos.
    const ahora = nuevo.updated_at;

    return this.prisma.$transaction(async (tx) => {
      // Bloqueo optimista: solo se actualiza si el hardware sigue como se leyó.
      // Evita que dos transiciones simultáneas lo dejen en un estado incoherente.
      const { count } = await tx.hardware.updateMany({
        where: {
          id_hardware,
          estado: anterior.estado,
          id_equipo_actual: anterior.id_equipo_actual,
        },
        data: {
          estado: nuevo.estado,
          id_equipo_actual: nuevo.id_equipo_actual,
          updated_at: ahora,
        },
      });
      if (count === 0) throw new HardwareModificadoConcurrentementeException();

      // Cierra el/los movimientos abiertos; `motivo_retiro` guarda por qué se
      // retiró el componente del equipo.
      await tx.registro_hardware.updateMany({
        where: { id_hardware, is_actual: true },
        data: {
          is_actual: false,
          fecha_retiro: ahora,
          motivo_retiro: motivo,
          updated_at: ahora,
        },
      });

      // Solo un hardware instalado tiene movimiento abierto: se registra el
      // nuevo con el motivo de la intervención y el técnico responsable.
      if (nuevo.id_equipo_actual !== null) {
        await tx.registro_hardware.create({
          data: {
            id_hardware,
            id_equipo: nuevo.id_equipo_actual,
            is_actual: true,
            fecha_instalacion: ahora,
            motivo_retiro: motivo,
            id_tecnico_resp: id_tecnico_resp ? Number(id_tecnico_resp) : null,
          },
        });
      }

      const actualizado = await tx.hardware.findUniqueOrThrow({
        where: { id_hardware },
        include: HARDWARE_INCLUDE,
      });
      return HardwareMapper.toDomain(actualizado);
    });
  }

  async existeEquipo(id_equipo: number): Promise<boolean> {
    const total = await this.prisma.equipos.count({ where: { id_equipo } });
    return total > 0;
  }

  async findAll(filterDto: FilterHardwareDto): Promise<{
    data: Hardware[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const { page = 1, limit = 10 } = filterDto;
    const skip = (page - 1) * limit;
    const where = this.buildWhere(filterDto);

    const [total, entities] = await Promise.all([
      this.prisma.hardware.count({ where }),
      this.prisma.hardware.findMany({
        where,
        include: HARDWARE_INCLUDE,
        skip,
        take: limit,
        orderBy: [{ created_at: 'desc' }, { id_hardware: 'desc' }],
      }),
    ]);

    return {
      data: entities.map(HardwareMapper.toDomain),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Hardware con su ubicación actual e historial completo de movimientos.
  async findById(id: number): Promise<Hardware | null> {
    const entity = await this.prisma.hardware.findUnique({
      where: { id_hardware: id },
      include: HARDWARE_DETALLE_INCLUDE,
    });
    if (!entity) return null;
    return HardwareMapper.toDomain(entity);
  }

  // Listado plano (sin paginación) para selectores y autocompletados:
  // solo las columnas necesarias y filtros opcionales por estado, tipo de
  // componente y equipo donde está instalado.
  async findOptions(
    filters: GetHardwareOptionsQueryDto,
  ): Promise<HardwareOptionResponseDto[]> {
    const { estado, tipo_componente, id_equipo_actual } = filters;

    const entities = await this.prisma.hardware.findMany({
      where: {
        ...(estado && { estado }),
        ...(tipo_componente && { tipo_componente }),
        ...(id_equipo_actual !== undefined && { id_equipo_actual }),
      },
      select: {
        id_hardware: true,
        numero_serie: true,
        marca_modelo: true,
        tipo_componente: true,
        estado: true,
      },
      orderBy: [{ marca_modelo: 'asc' }, { numero_serie: 'asc' }],
    });

    return entities.map((entity) => ({
      id_hardware: entity.id_hardware,
      numero_serie: entity.numero_serie,
      marca_modelo: entity.marca_modelo,
      tipo_componente: TipoComponente[entity.tipo_componente],
      estado: EstadoHardware[entity.estado],
    }));
  }

  /**
   * Traduce los filtros del listado a una condición de Prisma.
   * Los filtros de ubicación (cliente, sucursal, área) se aplican sobre el
   * equipo al que está asignado el hardware (`equipo_actual`).
   * En MySQL `contains` y la igualdad no distinguen mayúsculas/minúsculas
   * (por la collation de la columna), por eso no se usa `mode: 'insensitive'`.
   */
  private buildWhere(filter: FilterHardwareDto): Prisma.hardwareWhereInput {
    const {
      search,
      tipo_componente,
      estado,
      proveedor,
      id_cliente,
      id_sucursal,
      id_area,
    } = filter;

    const where: Prisma.hardwareWhereInput = {};

    if (search) {
      // `tipo_componente` es un enum: no admite `contains`, así que se busca
      // por los tipos cuya etiqueta legible coincide con el texto.
      const tipos = this.tiposQueCoinciden(search);

      where.OR = [
        { numero_serie: { contains: search } },
        { marca_modelo: { contains: search } },
        { proveedor: { contains: search } },
        ...(tipos.length > 0 ? [{ tipo_componente: { in: tipos } }] : []),
      ];
    }

    if (tipo_componente) {
      where.tipo_componente = tipo_componente;
    }

    if (estado) {
      where.estado = estado;
    }

    if (proveedor) {
      where.proveedor = { contains: proveedor };
    }

    const equipoActual: Prisma.equiposWhereInput = {};

    if (id_cliente !== undefined) {
      equipoActual.id_cliente = id_cliente;
    }

    if (id_sucursal !== undefined) {
      equipoActual.id_sucursal = id_sucursal;
    }

    if (id_area !== undefined) {
      equipoActual.id_area = id_area;
    }

    if (Object.keys(equipoActual).length > 0) {
      where.equipo_actual = { is: equipoActual };
    }

    return where;
  }

  private tiposQueCoinciden(search: string): TipoComponente[] {
    const texto = search.toLowerCase();
    return Object.values(TipoComponente).filter((tipo) =>
      TIPO_COMPONENTE_LABEL[tipo].toLowerCase().includes(texto),
    );
  }
}
