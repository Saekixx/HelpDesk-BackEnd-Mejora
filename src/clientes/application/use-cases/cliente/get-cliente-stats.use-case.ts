import { Inject, Injectable } from '@nestjs/common';
import {
  CLIENTE_REPOSITORY,
  ClienteRepositoryPort,
} from '@/clientes/domain/ports/cliente.repository.port';
import { ClienteStatsResult } from '@/clientes/domain/dto/cliente-stats.dto';

@Injectable()
export class GetClienteStatsUseCase {
  constructor(
    @Inject(CLIENTE_REPOSITORY)
    private readonly clienteRepository: ClienteRepositoryPort,
  ) {}

  async execute(): Promise<ClienteStatsResult> {
    return await this.clienteRepository.getStats();
  }
}
