import { Inject, Injectable } from '@nestjs/common';
import {
  CLIENTE_REPOSITORY,
  ClienteRepositoryPort,
} from '@/clientes/domain/ports/cliente.repository.port';
import {
  CreateClienteCommand,
  CreateClienteResult,
} from '@/clientes/domain/entities/cliente.entity';

@Injectable()
export class CreateClienteUseCase {
  constructor(
    @Inject(CLIENTE_REPOSITORY)
    private readonly clienteRepository: ClienteRepositoryPort,
  ) {}

  // Registro de un cliente en 3 pasos (empresa, responsable y sucursal
  // principal). Las validaciones de duplicados (número de documento y correo
  // del responsable) y la creación del cliente, el usuario responsable y la
  // sucursal matriz se resuelven de forma atómica en el repositorio (ver
  // ClientePrismaRepository.create, que usa $transaction), por lo que aquí no
  // se repiten para evitar condiciones de carrera.
  async execute(command: CreateClienteCommand): Promise<CreateClienteResult> {
    return this.clienteRepository.create(command);
  }
}
