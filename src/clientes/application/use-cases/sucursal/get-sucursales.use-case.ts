import { Inject, Injectable } from '@nestjs/common';
import {
  SUCURSAL_REPOSITORY,
  SucursalRepositoryPort,
  PaginatedSucursalesResult,
} from '@/clientes/domain/ports/sucursal.repository.port';
import { GetSucursalesFilterDto } from '@/clientes/domain/dto/get-sucursales-filter.dto';

@Injectable()
export class GetSucursalesUseCase {
  constructor(
    @Inject(SUCURSAL_REPOSITORY)
    private readonly sucursalRepository: SucursalRepositoryPort,
  ) {}

  async execute(
    filters: GetSucursalesFilterDto,
  ): Promise<PaginatedSucursalesResult> {
    return await this.sucursalRepository.findAll(filters);
  }
}