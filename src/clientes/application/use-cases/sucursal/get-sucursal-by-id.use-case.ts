import { Inject, Injectable } from '@nestjs/common';
import {
  SUCURSAL_REPOSITORY,
  SucursalRepositoryPort,
} from '@/clientes/domain/ports/sucursal.repository.port';
import { SucursalDetail } from '@/clientes/domain/entities/sucursal.entity';
import { SucursalNotFoundException } from '@/clientes/domain/exceptions/sucursal.exceptions';

@Injectable()
export class GetSucursalByIdUseCase {
  constructor(
    @Inject(SUCURSAL_REPOSITORY)
    private readonly sucursalRepository: SucursalRepositoryPort,
  ) {}

  async execute(id: number): Promise<SucursalDetail> {
    const sucursal = await this.sucursalRepository.findDetailById(id);
    if (!sucursal) throw new SucursalNotFoundException();
    return sucursal;
  }
}
