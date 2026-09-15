import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateEquipoUseCase } from './create-equipo.use-case';
import { EQUIPO_REPOSITORY } from '@/equipos/domain/ports/equipo.repository.port';
import { Equipo } from '@/equipos/domain/entities/equipo.entity';
import { CreateEquipoDto } from '@/equipos/domain/dto/create-equipo.dto';
import { EquipoAlreadyExistsException } from '@/equipos/domain/exceptions/equipo.exceptions';

describe('CreateEquipoUseCase', () => {
  let useCase: CreateEquipoUseCase;
  let equipoRepository: {
    existsByNumSerie: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };

  const baseDto: CreateEquipoDto = {
    tipo: 'Laptop',
    marca: 'Dell',
  };

  beforeEach(async () => {
    equipoRepository = {
      existsByNumSerie: vi.fn().mockResolvedValue(false),
      create: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateEquipoUseCase,
        { provide: EQUIPO_REPOSITORY, useValue: equipoRepository },
      ],
    }).compile();

    useCase = module.get(CreateEquipoUseCase);
  });

  it('crea el equipo sin validar duplicados si no informa num_serie', async () => {
    const created = new Equipo({ ...baseDto, is_active: true });
    equipoRepository.create.mockResolvedValue(created);

    const result = await useCase.execute(baseDto);

    expect(equipoRepository.existsByNumSerie).not.toHaveBeenCalled();
    expect(equipoRepository.create).toHaveBeenCalledWith({
      ...baseDto,
      is_active: true,
    });
    expect(result).toBe(created);
  });

  it('asigna is_active: true por defecto cuando no viene informado', async () => {
    equipoRepository.create.mockResolvedValue(
      new Equipo({ ...baseDto, is_active: true }),
    );

    await useCase.execute(baseDto);

    expect(equipoRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ is_active: true }),
    );
  });

  it('respeta is_active cuando viene informado explícitamente', async () => {
    equipoRepository.create.mockResolvedValue(
      new Equipo({ ...baseDto, is_active: false }),
    );

    await useCase.execute({ ...baseDto, is_active: false });

    expect(equipoRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ is_active: false }),
    );
  });

  it('valida duplicados por num_serie cuando viene informado', async () => {
    const dto: CreateEquipoDto = { ...baseDto, num_serie: 'SN-001' };
    equipoRepository.create.mockResolvedValue(
      new Equipo({ ...dto, is_active: true }),
    );

    await useCase.execute(dto);

    expect(equipoRepository.existsByNumSerie).toHaveBeenCalledWith('SN-001');
  });

  it('lanza EquipoAlreadyExistsException si el num_serie ya está en uso', async () => {
    equipoRepository.existsByNumSerie.mockResolvedValue(true);
    const dto: CreateEquipoDto = { ...baseDto, num_serie: 'SN-001' };

    await expect(useCase.execute(dto)).rejects.toThrow(
      EquipoAlreadyExistsException,
    );
    expect(equipoRepository.create).not.toHaveBeenCalled();
  });
});