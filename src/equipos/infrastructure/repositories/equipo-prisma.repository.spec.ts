import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PrismaService } from '@/common/infrastructure/prisma/prisma.service';
import { EquipoPrismaRepository } from './equipo-prisma.repository';
import { EquipoNotFoundException } from '@/equipos/domain/exceptions/equipo.exceptions';

describe('EquipoPrismaRepository', () => {
  let repository: EquipoPrismaRepository;
  let prisma: {
    equipos: {
      findMany: ReturnType<typeof vi.fn>;
      count: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
  };

  const prismaEquipoBase = {
    id_equipo: 1,
    tipo: 'Laptop',
    marca: 'Dell',
    num_serie: 'SN-001',
    nombre_usuario: null,
    ult_revision: null,
    rev_programada: null,
    id_trabajador: null,
    id_cliente: 1,
    id_sucursal: null,
    id_area: null,
    is_active: true,
    created_at: new Date('2026-01-01'),
    updated_at: new Date('2026-01-01'),
  };

  beforeEach(async () => {
    prisma = {
      equipos: {
        findMany: vi.fn().mockResolvedValue([]),
        count: vi.fn().mockResolvedValue(0),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EquipoPrismaRepository,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    repository = module.get(EquipoPrismaRepository);
  });

  describe('findAll', () => {
    it('aplica page/limit por defecto y construye el where vacío sin filtros', async () => {
      await repository.findAll({});

      expect(prisma.equipos.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: {}, skip: 0, take: 10 }),
      );
    });

    it('filtra por id_cliente e id_sucursal, y calcula el skip según page/limit', async () => {
      await repository.findAll({
        id_cliente: 1,
        id_sucursal: 2,
        page: 2,
        limit: 5,
      });

      expect(prisma.equipos.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id_cliente: 1, id_sucursal: 2 },
          skip: 5,
          take: 5,
        }),
      );
    });

    it('filtra por is_active cuando viene informado', async () => {
      await repository.findAll({ is_active: false });

      expect(prisma.equipos.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { is_active: false } }),
      );
    });

    it('construye búsqueda OR por tipo, marca y num_serie con "search"', async () => {
      await repository.findAll({ search: 'Dell' });

      expect(prisma.equipos.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { tipo: { contains: 'Dell' } },
              { marca: { contains: 'Dell' } },
              { num_serie: { contains: 'Dell' } },
            ],
          },
        }),
      );
    });

    it('incluye las relaciones resumidas de cliente, sucursal, área y trabajador', async () => {
      await repository.findAll({});

      expect(prisma.equipos.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: {
            clientes: {
              select: { id_cliente: true, nombre_principal: true },
            },
            sucursales: {
              select: { id_sucursal: true, nombre_sucursal: true },
            },
            area: { select: { id_area: true, nombre_area: true } },
            usuarios: {
              select: { id_usuario: true, nombre: true, apellido: true },
            },
          },
        }),
      );
    });

    it('retorna la data mapeada junto con los metadatos de paginación', async () => {
      prisma.equipos.findMany.mockResolvedValue([
        {
          ...prismaEquipoBase,
          clientes: null,
          sucursales: null,
          area: null,
          usuarios: null,
        },
      ]);
      prisma.equipos.count.mockResolvedValue(1);

      const result = await repository.findAll({ page: 1, limit: 10 });

      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(1);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id_equipo).toBe(1);
    });
  });

  describe('findById', () => {
    it('retorna null si Prisma no encuentra el equipo', async () => {
      prisma.equipos.findUnique.mockResolvedValue(null);

      const result = await repository.findById(999);

      expect(result).toBeNull();
    });

    it('retorna el equipo mapeado a dominio si existe', async () => {
      prisma.equipos.findUnique.mockResolvedValue(prismaEquipoBase);

      const result = await repository.findById(1);

      expect(result?.id_equipo).toBe(1);
      expect(result?.tipo).toBe('Laptop');
    });
  });

  describe('create', () => {
    it('conecta únicamente las relaciones informadas', async () => {
      prisma.equipos.create.mockResolvedValue(prismaEquipoBase);

      await repository.create({
        tipo: 'Laptop',
        marca: 'Dell',
        id_cliente: 1,
      });

      expect(prisma.equipos.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          tipo: 'Laptop',
          marca: 'Dell',
          is_active: true,
          clientes: { connect: { id_cliente: 1 } },
        }),
      });

      const callArg = prisma.equipos.create.mock.calls[0][0];
      expect(callArg.data.usuarios).toBeUndefined();
      expect(callArg.data.sucursales).toBeUndefined();
      expect(callArg.data.area).toBeUndefined();
    });
  });

  describe('update', () => {
    it('lanza EquipoNotFoundException si el equipo no existe', async () => {
      prisma.equipos.findUnique.mockResolvedValue(null);

      await expect(repository.update(999, { marca: 'HP' })).rejects.toThrow(
        EquipoNotFoundException,
      );
      expect(prisma.equipos.update).not.toHaveBeenCalled();
    });

    it('conecta la relación cuando el id llega con un valor truthy', async () => {
      prisma.equipos.findUnique.mockResolvedValue(prismaEquipoBase);
      prisma.equipos.update.mockResolvedValue(prismaEquipoBase);

      await repository.update(1, { id_sucursal: 2 });

      expect(prisma.equipos.update).toHaveBeenCalledWith({
        where: { id_equipo: 1 },
        data: expect.objectContaining({
          sucursales: { connect: { id_sucursal: 2 } },
        }),
      });
    });

    it('desconecta la relación cuando el id llega en 0', async () => {
      prisma.equipos.findUnique.mockResolvedValue(prismaEquipoBase);
      prisma.equipos.update.mockResolvedValue(prismaEquipoBase);

      await repository.update(1, { id_sucursal: 0 });

      expect(prisma.equipos.update).toHaveBeenCalledWith({
        where: { id_equipo: 1 },
        data: expect.objectContaining({ sucursales: { disconnect: true } }),
      });
    });

    it('no incluye una relación en el data si su id no viene en el dto', async () => {
      prisma.equipos.findUnique.mockResolvedValue(prismaEquipoBase);
      prisma.equipos.update.mockResolvedValue(prismaEquipoBase);

      await repository.update(1, { marca: 'HP' });

      const callArg = prisma.equipos.update.mock.calls[0][0];
      expect(callArg.data.sucursales).toBeUndefined();
      expect(callArg.data.clientes).toBeUndefined();
      expect(callArg.data.usuarios).toBeUndefined();
      expect(callArg.data.area).toBeUndefined();
    });
  });

  describe('toggleStatus', () => {
    it('lanza EquipoNotFoundException si el equipo no existe', async () => {
      prisma.equipos.findUnique.mockResolvedValue(null);

      await expect(repository.toggleStatus(999)).rejects.toThrow(
        EquipoNotFoundException,
      );
    });

    it('alterna is_active de true a false', async () => {
      prisma.equipos.findUnique.mockResolvedValue({
        ...prismaEquipoBase,
        is_active: true,
      });
      prisma.equipos.update.mockResolvedValue({
        ...prismaEquipoBase,
        is_active: false,
      });

      const result = await repository.toggleStatus(1);

      expect(prisma.equipos.update).toHaveBeenCalledWith({
        where: { id_equipo: 1 },
        data: { is_active: false },
      });
      expect(result.is_active).toBe(false);
    });
  });

  describe('existsByNumSerie', () => {
    it('retorna true si count > 0', async () => {
      prisma.equipos.count.mockResolvedValue(1);

      const result = await repository.existsByNumSerie('SN-001');

      expect(prisma.equipos.count).toHaveBeenCalledWith({
        where: { num_serie: 'SN-001' },
      });
      expect(result).toBe(true);
    });

    it('retorna false si count es 0', async () => {
      prisma.equipos.count.mockResolvedValue(0);

      const result = await repository.existsByNumSerie('SN-999');

      expect(result).toBe(false);
    });
  });
});