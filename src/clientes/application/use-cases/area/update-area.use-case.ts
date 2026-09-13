import { Inject, Injectable } from '@nestjs/common';
import {
  AREA_REPOSITORY,
  AreaRepositoryPort,
} from '@/clientes/domain/ports/area.repository.port';
import {
  SUCURSAL_REPOSITORY,
  SucursalRepositoryPort,
} from '@/clientes/domain/ports/sucursal.repository.port';
import { Area } from '@/clientes/domain/entities/area.entity';
import { UpdateAreaDto } from '@/clientes/domain/dto/update-area.dto';
import { AreaNotFoundException } from '@/clientes/domain/exceptions/area.exceptions';
import { SucursalNotFoundException } from '@/clientes/domain/exceptions/sucursal.exceptions';

@Injectable()
export class UpdateAreaUseCase {
  constructor(
    @Inject(AREA_REPOSITORY)
    private readonly areaRepository: AreaRepositoryPort,
    @Inject(SUCURSAL_REPOSITORY)
    private readonly sucursalRepository: SucursalRepositoryPort,
  ) {}

  async execute(id: number, dto: UpdateAreaDto): Promise<Area> {
    const existing = await this.areaRepository.findById(id);
    if (!existing) throw new AreaNotFoundException();

    // Si cambia la sucursal asignada, validar que exista
    if (
      dto.id_sucursal !== undefined &&
      dto.id_sucursal !== existing.id_sucursal
    ) {
      const sucursal = await this.sucursalRepository.findById(
        dto.id_sucursal,
      );
      if (!sucursal) throw new SucursalNotFoundException();
    }

    return await this.areaRepository.update(id, dto);
  }
}