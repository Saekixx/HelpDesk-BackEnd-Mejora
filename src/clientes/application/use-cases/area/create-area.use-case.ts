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
import { CreateAreaDto } from '@/clientes/domain/dto/create-area.dto';
import { SucursalNotFoundException } from '@/clientes/domain/exceptions/sucursal.exceptions';

@Injectable()
export class CreateAreaUseCase {
  constructor(
    @Inject(AREA_REPOSITORY)
    private readonly areaRepository: AreaRepositoryPort,
    @Inject(SUCURSAL_REPOSITORY)
    private readonly sucursalRepository: SucursalRepositoryPort,
  ) {}

  async execute(dto: CreateAreaDto): Promise<Area> {
    // Regla de negocio: la sucursal dueña del área debe existir
    const sucursal = await this.sucursalRepository.findById(dto.id_sucursal);
    if (!sucursal) throw new SucursalNotFoundException();

    return await this.areaRepository.create(dto);
  }
}