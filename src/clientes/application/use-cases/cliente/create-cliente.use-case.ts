import { Inject, Injectable } from '@nestjs/common';
import {
  CLIENTE_REPOSITORY,
  ClienteRepositoryPort,
} from '@/clientes/domain/ports/cliente.repository.port';
import { Cliente } from '@/clientes/domain/entities/cliente.entity';
import { CreateClienteDto } from '@/clientes/application/dto/create-cliente.dto';
import { DocumentoAlreadyInUseException } from '@/clientes/domain/exceptions/cliente.exceptions';

@Injectable()
export class CreateClienteUseCase {
  constructor(
    @Inject(CLIENTE_REPOSITORY)
    private readonly clienteRepository: ClienteRepositoryPort,
  ) {}

  async execute(dto: CreateClienteDto): Promise<Cliente> {
    // El numero de documento debe ser unico
    const documentoEnUso = await this.clienteRepository.existsByDocumento(
      dto.numero_documento,
    );
    if (documentoEnUso) throw new DocumentoAlreadyInUseException();

    const cliente = new Cliente({
      tipo_cliente: dto.tipo_cliente,
      numero_documento: dto.numero_documento,
      nombre_principal: dto.nombre_principal,
      direccion: dto.direccion,
      telefono: dto.telefono,
      correo: dto.correo,
      rubro: dto.rubro,
      fecha_inicio_plan: new Date(dto.fecha_inicio_plan),
      fecha_finalizacion_plan: new Date(dto.fecha_finalizacion_plan),
      costo_negociado: dto.costo_negociado,
      limite_equipos_contratado: dto.limite_equipos_contratado,
      id_plan: dto.id_plan,
      is_active: dto.is_active ?? true,
    });

    return await this.clienteRepository.create(cliente);
  }
}