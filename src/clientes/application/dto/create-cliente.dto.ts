import { TipoCliente } from '@/clientes/domain/entities/cliente.entity';


export interface CreateClienteDto {
  tipo_cliente: TipoCliente;
  numero_documento: string;
  nombre_principal: string;
  direccion: string;
  telefono: string;
  correo: string;
  rubro: string;
  fecha_inicio_plan: Date;
  fecha_finalizacion_plan: Date;
  costo_negociado: number;
  limite_equipos_contratado: number;
  id_plan: number;
  is_active?: boolean;
}