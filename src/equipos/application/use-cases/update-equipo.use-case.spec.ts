import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateEquipoUseCase } from './update-equipo.use-case';
import { EQUIPO_REPOSITORY } from '@/equipos/domain/ports/equipo.repository.port';
import { Equipo } from '@/equipos/domain/entities/equipo.entity';
import {
  EquipoNotFoundException,
  EquipoAlreadyExistsException,
} from '@/equipos/domain/exceptions/equipo.exceptions';

describe('UpdateEquipoUseCase', () => {
  let useCase: UpdateEquipoUseCase;
  let equipoRepository: {
    findById: ReturnType<typeof vi.fn>;
    existsByNumSerie: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };

  const existing = new Equipo({
    id_equipo: 1,
    tipo: 'Laptop',
    marca: 'Dell',
    num_serie: 'SN-001',
    is_active: true,
  });

  beforeEach(async () => {
    equipoRepository = {
      findById: vi.fn().mockResolvedValue(existing),
      existsByNumSerie: vi.fn().mockResolvedValue(false),
      update: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateEquipoUseCase,
        { provide: EQUIPO_REPOSITORY, useValue: equipoRepository },
      ],
    }).compile();

    useCase = module.get(UpdateEquipoUseCase);
  });

  it('actualiza el equipo cuando existe', async () => {
    const updated = new Equipo({ ...existing, marca: 'HP' });
    equipoRepository.update.mockResolvedValue(updated);

    const result = await useCase.execute(1, { marca: 'HP' });

    expect(equipoRepository.findById).toHaveBeenCalledWith(1);
    expect(equipoRepository.update).toHaveBeenCalledWith(1, { marca: 'HP' });
    expect(result).toBe(updated);
  });

  it('lanza EquipoNotFoundException si el equipo no existe', async () => {
    equipoRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(999, { marca: 'HP' })).rejects.toThrow(
      EquipoNotFoundException,
    );
    expect(equipoRepository.update).not.toHaveBeenCalled();
  });

  it('no valida num_serie si no cambia respecto al actual', async () => {
    await useCase.execute(1, { num_serie: 'SN-001', marca: 'HP' });

    expect(equipoRepository.existsByNumSerie).not.toHaveBeenCalled();
    expect(equipoRepository.update).toHaveBeenCalled();
  });

  it('valida num_serie cuando cambia respecto al actual', async () => {
    await useCase.execute(1, { num_serie: 'SN-002' });

    expect(equipoRepository.existsByNumSerie).toHaveBeenCalledWith('SN-002');
  });

  it('lanza EquipoAlreadyExistsException si el nuevo num_serie ya está en uso', async () => {
    equipoRepository.existsByNumSerie.mockResolvedValue(true);

    await expect(useCase.execute(1, { num_serie: 'SN-002' })).rejects.toThrow(
      EquipoAlreadyExistsException,
    );
    expect(equipoRepository.update).not.toHaveBeenCalled();
  });
});