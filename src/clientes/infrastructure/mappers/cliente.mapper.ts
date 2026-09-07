import { Cliente, TipoCliente } from '../../domain/entities/cliente.entity';
import { ClienteEntity } from '../entities/cliente.entity';

export class ClienteMapper {
  static toDomain(entity: ClienteEntity): Cliente {
    return new Cliente({
      id_cliente: entity.id_cliente,
      tipo_cliente: entity.tipo_cliente as TipoCliente,
      numero_documento: entity.numero_documento,
      nombre_principal: entity.nombre_principal,
      direccion: entity.direccion,
      telefono: entity.telefono,
      correo: entity.correo,
      rubro: entity.rubro,
      fecha_inicio_plan: entity.fecha_inicio_plan,
      fecha_finalizacion_plan: entity.fecha_finalizacion_plan,
      costo_negociado: Number(entity.costo_negociado),
      limite_equipos_contratado: entity.limite_equipos_contratado,
      is_active: entity.is_active,
      id_plan: entity.id_plan,
      fecha_registro: entity.fecha_registro,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  static toPersistence(domain: Cliente): ClienteEntity {
    const entity = new ClienteEntity();
    if (domain.id_cliente) {
      entity.id_cliente = domain.id_cliente;
    }
    entity.tipo_cliente = domain.tipo_cliente;
    entity.numero_documento = domain.numero_documento;
    entity.nombre_principal = domain.nombre_principal;
    entity.direccion = domain.direccion;
    entity.telefono = domain.telefono;
    entity.correo = domain.correo;
    entity.rubro = domain.rubro;
    entity.fecha_inicio_plan = domain.fecha_inicio_plan;
    entity.fecha_finalizacion_plan = domain.fecha_finalizacion_plan;
    entity.costo_negociado = domain.costo_negociado;
    entity.limite_equipos_contratado = domain.limite_equipos_contratado;
    entity.is_active = domain.is_active;
    entity.id_plan = domain.id_plan;
    return entity;
  }
}
