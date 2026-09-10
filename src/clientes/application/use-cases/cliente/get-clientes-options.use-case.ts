import { Inject, Injectable } from '@nestjs/common';
import {
  CLIENTE_REPOSITORY,
  ClienteRepositoryPort,
} from '@/clientes/domain/ports/cliente.repository.port';
import { OptionDto } from '@/clientes/domain/dto/user-options.dto';

@Injectable()
export class GetClientesOptionsUseCase {
  constructor(
    @Inject(CLIENTE_REPOSITORY)
    private readonly clienteRepository: ClienteRepositoryPort,
  ) {}

  async execute(): Promise<OptionDto[]> {
    return await this.clienteRepository.getClientesOptions();
  }
}
