import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  CLIENTE_REPOSITORY,
  ClienteRepositoryPort,
} from '@/clientes/domain/ports/cliente.repository.port';
import {
  UpdateClienteCommand,
  UpdateClienteResult,
} from '@/clientes/domain/entities/cliente.entity';

@Injectable()
export class UpdateClienteUseCase {
  constructor(
    @Inject(CLIENTE_REPOSITORY)
    private readonly clienteRepository: ClienteRepositoryPort,
  ) {}

  async execute(
    id: number,
    command: UpdateClienteCommand,
  ): Promise<UpdateClienteResult> {
    // Un PATCH sin ningún campo no tiene nada que actualizar
    const hayCambios = Object.values(command).some(
      (valor) => valor !== undefined,
    );
    if (!hayCambios) {
      throw new BadRequestException(
        'Debe proporcionar al menos un campo para actualizar',
      );
    }

    return await this.clienteRepository.update(id, command);
  }
}
