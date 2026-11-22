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
import { UpdateSucursalDto } from '@/clientes/domain/dto/update-sucursal.dto';
import { ClienteNotFoundException } from '@/clientes/domain/exceptions/cliente.exceptions';
import { SucursalNotFoundException } from '@/clientes/domain/exceptions/sucursal.exceptions';

@Injectable()
export class UpdateSucursalUseCase {
  constructor(
    @Inject(SUCURSAL_REPOSITORY)
    private readonly sucursalRepository: SucursalRepositoryPort,
    @Inject(CLIENTE_REPOSITORY)
    private readonly clienteRepository: ClienteRepositoryPort,
  ) {}

  // Actualiza la sucursal (PATCH /sucursales/:id). Si el dto trae `encargado`,
  // el repositorio sincroniza en la misma transacción las columnas de la
  // sucursal y la cuenta del usuario vinculado, y responde 409 si el correo ya
  // pertenece a otro usuario. Aquí solo se validan las reglas previas.
  async execute(id: number, dto: UpdateSucursalDto): Promise<Sucursal> {
    const existing = await this.sucursalRepository.findById(id);
    if (!existing) throw new SucursalNotFoundException();

    // Si cambia el cliente asignado, validar que exista
    if (
      dto.id_cliente !== undefined &&
      dto.id_cliente !== existing.id_cliente
    ) {
      const cliente = await this.clienteRepository.findById(dto.id_cliente);
      if (!cliente) throw new ClienteNotFoundException();
    }

    return await this.sucursalRepository.update(id, dto);
  }
}
