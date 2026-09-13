import { Inject, Injectable } from '@nestjs/common';
import {
  CLIENTE_REPOSITORY,
  ClienteRepositoryPort,
} from '@/clientes/domain/ports/cliente.repository.port';
import { Cliente } from '@/clientes/domain/entities/cliente.entity';
import { ClienteNotFoundException } from '@/clientes/domain/exceptions/cliente.exceptions';

@Injectable()
export class GetClienteByIdUseCase {
  constructor(
    @Inject(CLIENTE_REPOSITORY)
    private readonly clienteRepository: ClienteRepositoryPort,
  ) {}

  async execute(id: number): Promise<Cliente> {
    const cliente = await this.clienteRepository.findById(id);
    if (!cliente) throw new ClienteNotFoundException();
    return cliente;
  }
}