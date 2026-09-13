import { TipoCliente } from '@/clientes/domain/entities/cliente.entity';

// Contrato de aplicación para la creación de un cliente.
// Las fechas viajan como string ISO (YYYY-MM-DD); el caso de uso
// se encarga de convertirlas a Date antes de construir la entidad.
export interface CreateClienteDto {
  tipo_cliente: TipoCliente;
  numero_documento: string;
  nombre_principal: string;
  direccion: string;
  telefono: string;
  correo: string;
  rubro: string;
  fecha_inicio_plan: string;
  fecha_finalizacion_plan: string;
  costo_negociado: number;
  limite_equipos_contratado: number;
  id_plan: number;
  is_active?: boolean;
}