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
// estructura de creación (CreateSucursalDto): el encargado viaja anidado.
// `id_zona: null` desasigna la zona de la sucursal.
export interface UpdateSucursalDto {
  id_cliente?: number;
  nombre_sucursal?: string;
  direccion?: string;
  id_zona?: number | null;
  encargado?: UpdateSucursalEncargadoCommand;
}
