import { Inject, Injectable } from '@nestjs/common';
import {
  SUCURSAL_REPOSITORY,
  SucursalRepositoryPort,
} from '@/clientes/domain/ports/sucursal.repository.port';
import { SucursalStats } from '@/clientes/domain/entities/sucursal.entity';

@Injectable()
export class GetSucursalStatsUseCase {
  constructor(
    @Inject(SUCURSAL_REPOSITORY)
    private readonly sucursalRepository: SucursalRepositoryPort,
  ) {}

  async execute(): Promise<SucursalStats> {
    return await this.sucursalRepository.getStats();
  }
}
