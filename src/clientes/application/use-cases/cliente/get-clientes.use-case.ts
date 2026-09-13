import { Inject, Injectable } from '@nestjs/common';
import {
  CLIENTE_REPOSITORY,
  ClienteRepositoryPort,
  PaginatedClientesResult,
} from '@/clientes/domain/ports/cliente.repository.port';
import { GetClientesFilterDto } from '@/clientes/domain/dto/get-clientes-filter.dto';

@Injectable()
export class GetClientesUseCase {
  constructor(
    @Inject(CLIENTE_REPOSITORY)
    private readonly clienteRepository: ClienteRepositoryPort,
  ) {}

  async execute(
    filter: GetClientesFilterDto,
  ): Promise<PaginatedClientesResult> {
    return await this.clienteRepository.findAll(filter);
  }
}