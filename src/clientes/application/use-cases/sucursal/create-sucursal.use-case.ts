import { Inject, Injectable } from '@nestjs/common';
import {
  SUCURSAL_REPOSITORY,
  SucursalRepositoryPort,
} from '@/clientes/domain/ports/sucursal.repository.port';
import {
  CLIENTE_REPOSITORY,
  ClienteRepositoryPort,
} from '@/clientes/domain/ports/cliente.repository.port';
import { Sucursal } from '@/clientes/domain/entities/sucursal.entity';
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

  async execute(dto: CreateSucursalDto): Promise<Sucursal> {
    // Regla de negocio: el cliente (empresa) dueño de la sucursal debe existir
    const cliente = await this.clienteRepository.findById(dto.id_cliente);
    if (!cliente) throw new ClienteNotFoundException();

    return await this.sucursalRepository.create(dto);
  }
}