import { Inject, Injectable } from '@nestjs/common';
import { OptionDto } from '@/clientes/domain/dto/user-options.dto';
import {
  SUCURSAL_REPOSITORY,
  SucursalRepositoryPort,
} from '@/clientes/domain/ports/sucursal.repository.port';

@Injectable()
export class GetSucursalesOptionsUseCase {
  constructor(
    @Inject(SUCURSAL_REPOSITORY)
    private readonly sucursalRepository: SucursalRepositoryPort,
  ) {}

  async execute(clienteId: number): Promise<OptionDto[]> {
    return await this.sucursalRepository.getSucursalesOptions(clienteId);
  }
}
