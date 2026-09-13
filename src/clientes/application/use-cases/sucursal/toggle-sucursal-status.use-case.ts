import { Inject, Injectable } from '@nestjs/common';
import {
  SUCURSAL_REPOSITORY,
  SucursalRepositoryPort,
} from '@/clientes/domain/ports/sucursal.repository.port';
import { Sucursal } from '@/clientes/domain/entities/sucursal.entity';

@Injectable()
export class ToggleSucursalStatusUseCase {
  constructor(
    @Inject(SUCURSAL_REPOSITORY)
    private readonly sucursalRepository: SucursalRepositoryPort,
  ) {}

  async execute(id: number): Promise<Sucursal> {
    // El adaptador de persistencia valida existencia y lanza
    // SucursalNotFoundException si la sucursal no existe.
    return await this.sucursalRepository.toggleStatus(id);
  }
}