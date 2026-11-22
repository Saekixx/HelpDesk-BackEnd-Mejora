import { Inject, Injectable } from '@nestjs/common';
import {
  SUCURSAL_REPOSITORY,
  SucursalRepositoryPort,
} from '@/clientes/domain/ports/sucursal.repository.port';
import {
  CLIENTE_REPOSITORY,
  ClienteRepositoryPort,
} from '@/clientes/domain/ports/cliente.repository.port';
import { CreateSucursalResult } from '@/clientes/domain/entities/sucursal.entity';
import { CreateSucursalDto } from '@/clientes/domain/dto/create-sucursal.dto';
import { ClienteNotFoundException } from '@/clientes/domain/exceptions/cliente.exceptions';

@Injectable()
export class CreateSucursalUseCase {
  constructor(
    @Inject(SUCURSAL_REPOSITORY)
    private readonly sucursalRepository: SucursalRepositoryPort,
    @Inject(CLIENTE_REPOSITORY)
    private readonly clienteRepository: ClienteRepositoryPort,
  ) {}

  // Registra una sucursal junto con la cuenta de usuario de su encargado local.
  // La existencia del cliente se valida aquí (regla de negocio); los duplicados
  // de correo y la creación de la sucursal y el usuario se resuelven de forma
  // atómica en el repositorio (SucursalPrismaRepository.create, que usa
  // $transaction), por lo que no se repiten aquí para evitar condiciones de
  // carrera.
  async execute(dto: CreateSucursalDto): Promise<CreateSucursalResult> {
    // Regla de negocio: el cliente (empresa) dueño de la sucursal debe existir
    const cliente = await this.clienteRepository.findById(dto.id_cliente);
    if (!cliente) throw new ClienteNotFoundException();

    return await this.sucursalRepository.create(dto);
  }
}
