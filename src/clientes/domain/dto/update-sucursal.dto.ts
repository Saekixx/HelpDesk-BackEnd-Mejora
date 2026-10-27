// src/clientes/domain/dto/update-sucursal.dto.ts

// Contrato de actualización de una sucursal. Todos los campos son opcionales.
// Se mantiene plano (encargado/telefono/correo como texto de la sucursal): el
// alta con cuenta de encargado anidada solo aplica a la creación.
export interface UpdateSucursalDto {
  nombre_sucursal?: string;
  encargado?: string;
  telefono?: string;
  direccion?: string;
  correo?: string;
  id_cliente?: number;
  id_zona?: number;
  is_active?: boolean;
}
