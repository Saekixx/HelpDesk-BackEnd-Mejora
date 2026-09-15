import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { CLIENTE_REPOSITORY, ClienteRepository } from '@/clientes/domain/ports/cliente.repository.port';
import { UpdateClienteDto } from '../../dto/update-cliente.dto';
import { ClienteEntity } from '@/clientes/domain/entities/cliente.entity';
import { SucursalAnidadaDto } from '../../dto/create-cliente.dto';

@Injectable()
export class UpdateClienteUseCase {
  constructor(
    @Inject(CLIENTE_REPOSITORY)
    private readonly clienteRepository: ClienteRepository,
  ) {}

  async execute(id: number, dto: UpdateClienteDto): Promise<ClienteEntity> {
    const clienteExistente = await this.clienteRepository.findById(id);

    if (!clienteExistente) {
      throw new NotFoundException(`El cliente con ID ${id} no existe`);
    }

    const sucursalesAdicionales = dto.sucursales_adicionales?.map((s: SucursalAnidadaDto) => ({
      nombre_sucursal: s.nombre_sucursal,
      encargado: s.encargado ?? '',
      telefono: s.telefono ?? '',
      correo: s.correo ?? '',
      direccion: s.direccion ?? '',
      ubigeo: s.ubigeo ?? null,
    }));

    return this.clienteRepository.update(id, {
      ...dto,
      sucursales_adicionales: sucursalesAdicionales,
    });
  }
}