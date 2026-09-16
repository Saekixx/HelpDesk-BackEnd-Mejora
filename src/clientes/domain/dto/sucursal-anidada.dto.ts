// src/clientes/domain/dto/sucursal-anidada.dto.ts

// Datos de una sucursal (principal o adicional) enviados de forma anidada
// dentro del payload de creación de un cliente (POST /clientes).
export interface SucursalAnidadaDto {
  nombre: string;
  encargado?: string;
  telefono?: string;
  correo?: string;
  direccion?: string;
}

// Variante para PUT /clientes/:id: todos los campos son opcionales,
// incluido el nombre, ya que solo se actualizan los campos informados
// sobre la sucursal principal existente.
export type UpdateSucursalAnidadaDto = Partial<SucursalAnidadaDto>;

// Forma normalizada (nombres de columna de Prisma) que usan el caso de uso
// y el repositorio para crear una sucursal nueva de forma anidada.
export interface SucursalAnidadaPersistData {
  nombre_sucursal: string;
  encargado: string;
  telefono: string;
  correo: string;
  direccion: string;
}

export type UpdateSucursalAnidadaPersistData =
  Partial<SucursalAnidadaPersistData>;