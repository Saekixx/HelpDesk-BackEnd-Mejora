import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EquipoController } from './equipo.controller';
import { GetEquiposUseCase } from '@/equipos/application/use-cases/get-equipos.use-case';
import { GetEquipoByIdUseCase } from '@/equipos/application/use-cases/get-equipo-by-id.use-case';
import { CreateEquipoUseCase } from '@/equipos/application/use-cases/create-equipo.use-case';
import { UpdateEquipoUseCase } from '@/equipos/application/use-cases/update-equipo.use-case';
import { ToggleStatusEquipoUseCase } from '@/equipos/application/use-cases/toggle-status-equipo.use-case';
import { Equipo } from '@/equipos/domain/entities/equipo.entity';
import { GetEquiposQueryDto } from '../dtos/get-equipos-query.dto';
import { CreateEquipoHttpDto } from '../dtos/create-equipo-http.dto';
import { UpdateEquipoHttpDto } from '../dtos/update-equipo-http.dto';
import { JwtAuthGuard } from '@/auth/infrastructure/guards/jwt-auth.guard';
import { RoleGuard } from '@/auth/infrastructure/guards/role.guard';

describe('EquipoController', () => {
  let controller: EquipoController;
  let getEquiposUseCase: { execute: ReturnType<typeof vi.fn> };
  let getEquipoByIdUseCase: { execute: ReturnType<typeof vi.fn> };
  let createEquipoUseCase: { execute: ReturnType<typeof vi.fn> };
  let updateEquipoUseCase: { execute: ReturnType<typeof vi.fn> };
  let toggleStatusEquipoUseCase: { execute: ReturnType<typeof vi.fn> };

  const equipo = new Equipo({
    id_equipo: 1,
    tipo: 'Laptop',
    marca: 'Dell',
    is_active: true,
  });

  beforeEach(async () => {
    getEquiposUseCase = { execute: vi.fn() };
    getEquipoByIdUseCase = { execute: vi.fn() };
    createEquipoUseCase = { execute: vi.fn() };
    updateEquipoUseCase = { execute: vi.fn() };
    toggleStatusEquipoUseCase = { execute: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EquipoController],
      providers: [
        { provide: GetEquiposUseCase, useValue: getEquiposUseCase },
        { provide: GetEquipoByIdUseCase, useValue: getEquipoByIdUseCase },
        { provide: CreateEquipoUseCase, useValue: createEquipoUseCase },
        { provide: UpdateEquipoUseCase, useValue: updateEquipoUseCase },
        {
          provide: ToggleStatusEquipoUseCase,
          useValue: toggleStatusEquipoUseCase,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RoleGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(EquipoController);
  });

  describe('findAll', () => {
    it('retorna { message, data: { data, meta } } desestructurando el resultado paginado', async () => {
      getEquiposUseCase.execute.mockResolvedValue({
        data: [equipo],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });

      const query = { page: 1, limit: 10 } as GetEquiposQueryDto;
      const result = await controller.findAll(query);

      expect(getEquiposUseCase.execute).toHaveBeenCalledWith(query);
      expect(result).toEqual({
        message: 'Equipos obtenidos exitosamente',
        data: {
          data: [equipo],
          meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
        },
      });
    });
  });

  describe('findOne', () => {
    it('retorna { message, data } con el equipo encontrado', async () => {
      getEquipoByIdUseCase.execute.mockResolvedValue(equipo);

      const result = await controller.findOne(1);

      expect(getEquipoByIdUseCase.execute).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        message: 'Equipo obtenido exitosamente',
        data: equipo,
      });
    });
  });

  describe('create', () => {
    it('retorna { message, data } con el equipo creado', async () => {
      createEquipoUseCase.execute.mockResolvedValue(equipo);
      const dto = { tipo: 'Laptop', marca: 'Dell' } as CreateEquipoHttpDto;

      const result = await controller.create(dto);

      expect(createEquipoUseCase.execute).toHaveBeenCalledWith(dto);
      expect(result).toEqual({
        message: 'Equipo creado exitosamente',
        data: equipo,
      });
    });
  });

  describe('update', () => {
    it('retorna { message, data } con el equipo actualizado', async () => {
      const updated = new Equipo({ ...equipo, marca: 'HP' });
      updateEquipoUseCase.execute.mockResolvedValue(updated);
      const dto = { marca: 'HP' } as UpdateEquipoHttpDto;

      const result = await controller.update(1, dto);

      expect(updateEquipoUseCase.execute).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual({
        message: 'Equipo actualizado exitosamente',
        data: updated,
      });
    });
  });

  describe('toggleStatus', () => {
    it('retorna { message, data } con el equipo con el estado alternado', async () => {
      const toggled = new Equipo({ ...equipo, is_active: false });
      toggleStatusEquipoUseCase.execute.mockResolvedValue(toggled);

      const result = await controller.toggleStatus(1);

      expect(toggleStatusEquipoUseCase.execute).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        message: 'Estado del equipo actualizado exitosamente',
        data: toggled,
      });
    });
  });
});