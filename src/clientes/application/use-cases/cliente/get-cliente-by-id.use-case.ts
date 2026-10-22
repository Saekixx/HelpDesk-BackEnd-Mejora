import { Inject, Injectable } from '@nestjs/common';
import {
  CLIENTE_REPOSITORY,
  ClienteRepositoryPort,
} from '@/clientes/domain/ports/cliente.repository.port';
import { ClienteDetailView } from '@/clientes/domain/entities/cliente.entity';
import { ClienteNotFoundException } from '@/clientes/domain/exceptions/cliente.exceptions';

@Injectable()
export class GetClienteByIdUseCase {
  constructor(
    @Inject(CLIENTE_REPOSITORY)
    private readonly clienteRepository: ClienteRepositoryPort,
  ) {}

  async execute(id: number): Promise<ClienteDetailView> {
    const cliente = await this.clienteRepository.findDetailById(id);
    if (!cliente) throw new ClienteNotFoundException();
    return cliente;
  }
}
