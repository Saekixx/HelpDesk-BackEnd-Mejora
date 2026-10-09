import { PrismaService } from '@/common/infrastructure/prisma/prisma.service';
import {
  PaginatedZonasResult,
  ZonaRepositoryPort,
} from '@/zonas/domain/ports/zona.repository.port';
import { ZonaMapper } from './mappers/zona.mapper';
import { Zona } from '@/zonas/domain/entities/zona.entity';
import { Prisma } from '@prisma/client';
import { ZonaFilterCriteria } from '@/zonas/domain/criteria/zona-filter.criteria';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ZonaPrismaRepository implements ZonaRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async save(zona: Zona): Promise<Zona> {
    const data = ZonaMapper.toPersistence(zona);

    // Si la zona tiene un id_zona, significa que ya existe en la base de datos y debemos actualizarla
    if (zona.id_zona) {
      const updated = await this.prisma.zonas.update({
        where: { id_zona: zona.id_zona },
        data,
      });
      return ZonaMapper.toDomain(updated);
    }

    // Si la zona no tiene un id_zona, significa que es nueva y debemos crearla
    const created = await this.prisma.zonas.create({
      data: data as Prisma.zonasCreateInput,
    });
    // Retornar la zona creada en formato de dominio
    return ZonaMapper.toDomain(created);
  }

  async findById(id: number): Promise<Zona | null> {
    // Buscar la zona en la base de datos por su id_zona
    const entity = await this.prisma.zonas.findUnique({
      where: { id_zona: Number(id) },
    });
    // Si no se encuentra la zona, retornar null
    if (!entity) return null;
    // Si se encuentra la zona, mapearla a la entidad de dominio y retornarla
    return ZonaMapper.toDomain(entity);
  }

  async toggleStatus(id: number): Promise<Zona | null> {
    // Buscar la zona en la base de datos por su id_zona
    const entity = await this.prisma.zonas.findUnique({
      where: { id_zona: Number(id) },
    });
    // Si no se encuentra la zona, retornar null
    if (!entity) return null;
    // Cambiar el estado de la zona (is_active) al valor opuesto
    const updated = await this.prisma.zonas.update({
      where: { id_zona: Number(id) },
      data: { is_active: !entity.is_active },
    });
    // Retornar la zona actualizada en formato de dominio
    return ZonaMapper.toDomain(updated);
  }

  async findAllWithFilters(
    filters: ZonaFilterCriteria,
  ): Promise<PaginatedZonasResult> {
    // Desestructurar los filtros recibidos, asignando valores por defecto a page y limit
    const { search, is_active, page = 1, limit = 10 } = filters;
    // Crear un objeto where para los filtros de búsqueda
    const where: Prisma.zonasWhereInput = {};

    // Aplicar el filtro de búsqueda por nombre_zona si se proporciona
    if (search) where.nombre_zona = { contains: search };
    // Aplicar el filtro de estado activo/inactivo si se proporciona
    if (is_active !== undefined) where.is_active = is_active;

    // Calcular el número de registros a omitir para la paginación
    const skip = (page - 1) * limit;

    // Ejecutar las consultas a la base de datos en paralelo para obtener las zonas filtradas y el total de zonas que cumplen con los filtros
    const [entities, total] = await Promise.all([
      // Obtener las zonas de la base de datos con los filtros y paginación aplicados
      this.prisma.zonas.findMany({
        where,
        skip,
        take: limit,
      }),
      // Contar el total de zonas que cumplen con los filtros aplicados
      this.prisma.zonas.count({ where }),
    ]);

    return {
      // Mapear las zonas obtenidas a la entidad de dominio
      data: entities.map(ZonaMapper.toDomain),
      // Incluir el total de zonas que cumplen con los filtros
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit), // Calcular el total de páginas basado en el total de zonas y el límite por página
    };
  }

  async findOptions(): Promise<{ id_zona: number; nombre_zona: string }[]> {
    // Obtener todas las zonas de la base de datos, seleccionando solo los campos id_zona y nombre_zona
    const entities = await this.prisma.zonas.findMany({
      select: { id_zona: true, nombre_zona: true },
    });
    // Retornar las zonas obtenidas en formato de opciones
    return entities.map((entity) => ({
      id_zona: entity.id_zona,
      nombre_zona: entity.nombre_zona,
    }));
  }
}
