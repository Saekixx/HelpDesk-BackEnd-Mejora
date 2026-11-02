import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/infrastructure/prisma/prisma.service';
import { HardwareRepositoryPort } from '@/hardware/domain/ports/hardware.repository.port';
import { Hardware } from '@/hardware/domain/entities/hardware.entity';
import { HardwareMapper } from './mappers/hardware.mapper';
import { Prisma } from '@prisma/client';
import { HardwareOptionDto } from '@/hardware/domain/dtos/get-hardware.dto';
import { FilterHardwareDto } from '@/hardware/application/dtos/filter-hardware.dto';
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
    const updated = await this.prisma.hardware.update({
      // Solo se actualiza hardware ya persistido: `id_hardware` está definido.
      where: { id_hardware: hardware.id_hardware as number },
      data: HardwareMapper.toPersistence(hardware),
    });
    return HardwareMapper.toDomain(updated);
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

  async findById(id: number): Promise<Hardware | null> {
    const entity = await this.prisma.hardware.findUnique({
      where: { id_hardware: id },
      include: HARDWARE_INCLUDE,
    });
    if (!entity) return null;
    return HardwareMapper.toDomain(entity);
  }

  async getHardwareOptions(): Promise<HardwareOptionDto[]> {
    const entities = await this.prisma.hardware.findMany({
      where: { estado: 'DISPONIBLE' },
      select: {
        id_hardware: true,
        tipo_componente: true,
        marca_modelo: true,
        numero_serie: true,
      },
    });

    return entities.map((entity) => ({
      id: entity.id_hardware,
      nombre:
        `${TIPO_COMPONENTE_LABEL[TipoComponente[entity.tipo_componente]]} ${entity.marca_modelo ?? ''} (${entity.numero_serie})`.trim(),
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
