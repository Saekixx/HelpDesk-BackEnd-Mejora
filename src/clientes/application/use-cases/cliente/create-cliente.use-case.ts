import { Inject, Injectable } from '@nestjs/common';
import {
  CLIENTE_REPOSITORY,
  ClienteRepositoryPort,
} from '@/clientes/domain/ports/cliente.repository.port';
import { Cliente } from '@/clientes/domain/entities/cliente.entity';
import { CreateClienteDto } from '@/clientes/application/dto/create-cliente.dto';
import { DocumentoAlreadyInUseException } from '@/clientes/domain/exceptions/cliente.exceptions';
import {
  SucursalAnidadaDto,
  SucursalAnidadaPersistData,
} from '@/clientes/domain/dto/sucursal-anidada.dto';

function toSucursalPersistData(
  sucursal: SucursalAnidadaDto,
): SucursalAnidadaPersistData {
  return {
    nombre_sucursal: sucursal.nombre,
    encargado: sucursal.encargado ?? '',
    telefono: sucursal.telefono ?? '',
    correo: sucursal.correo ?? '',
    direccion: sucursal.direccion ?? '',
  };
}

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
      fecha_inicio_plan: dto.fecha_inicio_plan,
      fecha_finalizacion_plan: dto.fecha_finalizacion_plan,
      costo_negociado: dto.costo_negociado,
      limite_equipos_contratado: dto.limite_equipos_contratado,
      id_plan: dto.id_plan,
      is_active: dto.is_active ?? true,
    });

    // El cliente, su sucursal principal y sus sucursales adicionales se
    // registran de forma atómica en el repositorio (ver
    // ClientePrismaRepository.create, que usa $transaction).
    return await this.clienteRepository.create(cliente, {
      principal: toSucursalPersistData(dto.sucursal_principal),
      adicionales: (dto.sucursales_adicionales ?? []).map(
        toSucursalPersistData,
      ),
    });
  }
}