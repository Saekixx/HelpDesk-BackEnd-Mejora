// src/equipos/domain/dto/create-equipo.dto.ts

// Contrato de dominio para registrar un equipo: especificaciones base del
// activo, su ubicación organizacional y, opcionalmente, el trabajador asignado.
export interface CreateEquipoDto {
  nombre_equipo: string; // TAG del activo (ej. "PC-DELL-90")
  num_serie: string; // Número de serie único
  tipo: string; // Ej. "Desktop", "Laptop"
  marca_modelo: string; // Ej. "Dell Latitude 5540"
  id_cliente: number;
  id_sucursal: number;
  id_area: number;
  id_trabajador?: number | null; // null o ausente = sin trabajador asignado
}
