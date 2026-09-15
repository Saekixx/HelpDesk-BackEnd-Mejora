import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetEquiposUseCase } from './get-equipos.use-case';
import {
  EQUIPO_REPOSITORY,
  PaginatedEquiposResult,
} from '@/equipos/domain/ports/equipo.repository.port';

describe('GetEquiposUseCase', () => {
  let useCase: GetEquiposUseCase;
  let equipoRepository: { findAll: ReturnType<typeof vi.fn> };

  const paginatedResult: PaginatedEquiposResult = {
    data: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  };

  beforeEach(async () => {
    equipoRepository = {
      findAll: vi.fn().mockResolvedValue(paginatedResult),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetEquiposUseCase,
        { provide: EQUIPO_REPOSITORY, useValue: equipoRepository },
      ],
    }).compile();

    useCase = module.get(GetEquiposUseCase);
  });

  it('aplica page=1 y limit=10 por defecto cuando no vienen en el filtro', async () => {
    await useCase.execute({});

    expect(equipoRepository.findAll).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
    });
  });

  it('respeta page y limit cuando vienen informados en el filtro', async () => {
    await useCase.execute({ page: 3, limit: 25, search: 'Dell' });

    expect(equipoRepository.findAll).toHaveBeenCalledWith({
      page: 3,
      limit: 25,
      search: 'Dell',
    });
  });

  it('retorna el resultado paginado tal como lo entrega el repositorio', async () => {
    const result = await useCase.execute({});
    expect(result).toBe(paginatedResult);
  });
});