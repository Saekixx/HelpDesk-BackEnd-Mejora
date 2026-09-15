import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ToggleStatusEquipoUseCase } from './toggle-status-equipo.use-case';
import { EQUIPO_REPOSITORY } from '@/equipos/domain/ports/equipo.repository.port';
import { Equipo } from '@/equipos/domain/entities/equipo.entity';

describe('ToggleStatusEquipoUseCase', () => {
  let useCase: ToggleStatusEquipoUseCase;
  let equipoRepository: { toggleStatus: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    equipoRepository = { toggleStatus: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ToggleStatusEquipoUseCase,
        { provide: EQUIPO_REPOSITORY, useValue: equipoRepository },
      ],
    }).compile();

    useCase = module.get(ToggleStatusEquipoUseCase);
  });

  it('delega en el repositorio y retorna el equipo con el estado alternado', async () => {
    const toggled = new Equipo({
      id_equipo: 1,
      tipo: 'Laptop',
      marca: 'Dell',
      is_active: false,
    });
    equipoRepository.toggleStatus.mockResolvedValue(toggled);

    const result = await useCase.execute(1);

    expect(equipoRepository.toggleStatus).toHaveBeenCalledWith(1);
    expect(result).toBe(toggled);
    expect(result.is_active).toBe(false);
  });

  it('propaga el error del repositorio si el equipo no existe', async () => {
    equipoRepository.toggleStatus.mockRejectedValue(
      new Error('no encontrado'),
    );

    await expect(useCase.execute(999)).rejects.toThrow('no encontrado');
  });
});