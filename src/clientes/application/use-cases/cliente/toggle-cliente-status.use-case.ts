import { Inject, Injectable } from '@nestjs/common';
import {
  CLIENTE_REPOSITORY,
  ClienteRepositoryPort,
} from '@/clientes/domain/ports/cliente.repository.port';
import { Cliente } from '@/clientes/domain/entities/cliente.entity';

@Injectable()
export class ToggleClienteStatusUseCase {
  constructor(
    @Inject(CLIENTE_REPOSITORY)
    private readonly clienteRepository: ClienteRepositoryPort,
  ) {}

  async execute(id: number): Promise<Cliente> {
    // El adaptador de persistencia valida existencia y lanza
    // ClienteNotFoundException si el cliente no existe.
    return await this.clienteRepository.toggleStatus(id);
  }
}