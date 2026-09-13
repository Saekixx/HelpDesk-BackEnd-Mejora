import { Inject, Injectable } from '@nestjs/common';
import {
  CLIENTE_REPOSITORY,
  ClienteRepositoryPort,
} from '@/clientes/domain/ports/cliente.repository.port';
import { Cliente } from '@/clientes/domain/entities/cliente.entity';
import { UpdateClienteDto } from '@/clientes/application/dto/update-cliente.dto';
import {
  ClienteNotFoundException,
  DocumentoAlreadyInUseException,
} from '@/clientes/domain/exceptions/cliente.exceptions';

@Injectable()
export class UpdateClienteUseCase {
  constructor(
    @Inject(CLIENTE_REPOSITORY)
    private readonly clienteRepository: ClienteRepositoryPort,
  ) {}

  async execute(id: number, dto: UpdateClienteDto): Promise<Cliente> {
    const currentCliente = await this.clienteRepository.findById(id);
    if (!currentCliente) throw new ClienteNotFoundException();

    // Si cambia el numero de documento, validar que no este en uso por otro cliente
    if (
      dto.numero_documento &&
      dto.numero_documento !== currentCliente.numero_documento
    ) {
      const documentoEnUso = await this.clienteRepository.existsByDocumento(
        dto.numero_documento,
      );
      if (documentoEnUso) throw new DocumentoAlreadyInUseException();
    }

    const updatedCliente = new Cliente({
      id_cliente: currentCliente.id_cliente,
      tipo_cliente: dto.tipo_cliente ?? currentCliente.tipo_cliente,
      numero_documento:
        dto.numero_documento ?? currentCliente.numero_documento,
      nombre_principal:
        dto.nombre_principal ?? currentCliente.nombre_principal,
      direccion: dto.direccion ?? currentCliente.direccion,
      telefono: dto.telefono ?? currentCliente.telefono,
      correo: dto.correo ?? currentCliente.correo,
      rubro: dto.rubro ?? currentCliente.rubro,
      fecha_inicio_plan: dto.fecha_inicio_plan
        ? new Date(dto.fecha_inicio_plan)
        : currentCliente.fecha_inicio_plan,
      fecha_finalizacion_plan: dto.fecha_finalizacion_plan
        ? new Date(dto.fecha_finalizacion_plan)
        : currentCliente.fecha_finalizacion_plan,
      costo_negociado: dto.costo_negociado ?? currentCliente.costo_negociado,
      limite_equipos_contratado:
        dto.limite_equipos_contratado ??
        currentCliente.limite_equipos_contratado,
      id_plan: dto.id_plan ?? currentCliente.id_plan,
      // El estado se administra exclusivamente vía toggle-status
      is_active: currentCliente.is_active,
    });

    return await this.clienteRepository.update(id, updatedCliente);
  }
}