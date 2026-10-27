// src/clientes/domain/dto/create-sucursal.dto.ts

// Datos del encargado local de la sucursal. Con ellos se registra también la
// cuenta de usuario del encargado en la misma operación de creación.
export interface CreateSucursalEncargadoCommand {
  nombre: string;
  apellido: string;
  telefono_contacto?: string;
  correo_corporativo: string;
}

// Contrato de dominio para la creación de una sucursal junto con su encargado.
export interface CreateSucursalDto {
  id_cliente: number;
  nombre_sucursal: string;
  direccion: string;
  id_zona?: number;
  is_active?: boolean;
  encargado: CreateSucursalEncargadoCommand;
}
