import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetEquipoByIdUseCase } from './get-equipo-by-id.use-case';
import { EQUIPO_REPOSITORY } from '@/equipos/domain/ports/equipo.repository.port';
import { Equipo } from '@/equipos/domain/entities/equipo.entity';
import { EquipoNotFoundException } from '@/equipos/domain/exceptions/equipo.exceptions';

describe('GetEquipoByIdUseCase', () => {
  let useCase: GetEquipoByIdUseCase;
  let equipoRepository: { findById: ReturnType<typeof vi.fn> };

  const equipo = new Equipo({
    id_equipo: 1,
    tipo: 'Laptop',
    marca: 'Dell',
    is_active: true,
  });

  beforeEach(async () => {
    equipoRepository = { findById: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetEquipoByIdUseCase,
        { provide: EQUIPO_REPOSITORY, useValue: equipoRepository },
      ],
    }).compile();

    useCase = module.get(GetEquipoByIdUseCase);
  });

  it('retorna el equipo cuando existe', async () => {
    equipoRepository.findById.mockResolvedValue(equipo);

    const result = await useCase.execute(1);

    expect(result).toBe(equipo);
    expect(equipoRepository.findById).toHaveBeenCalledWith(1);
  });

  it('lanza EquipoNotFoundException cuando el equipo no existe', async () => {
    equipoRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(999)).rejects.toThrow(
      EquipoNotFoundException,
    );
  });
});