// src/clientes/domain/dto/update-sucursal.dto.ts

// Datos del encargado local que pueden actualizarse. Todos son opcionales: solo
// se modifican los campos enviados.
export interface UpdateSucursalEncargadoCommand {
  nombre?: string;
  apellido?: string;
  telefono_contacto?: string;
  correo_corporativo?: string;
}

// Contrato de dominio para la actualización parcial de una sucursal. Refleja la
// estructura de creación (CreateSucursalDto). El encargado puede llegar de dos
// formas (el frontend envía ambas):
// - `string`: nombre completo en texto plano (p. ej. "Carlos Vargas"). Se separa
//   en nombre y apellido y solo afecta a esos dos campos.
// - `UpdateSucursalEncargadoCommand`: objeto anidado con los campos a modificar.
// `id_zona: null` desasigna la zona de la sucursal.
export interface UpdateSucursalDto {
  id_cliente?: number;
  nombre_sucursal?: string;
  direccion?: string;
  id_zona?: number | null;
  encargado?: string | UpdateSucursalEncargadoCommand;
}
