// src/equipos/domain/dto/asignar-equipo.dto.ts

// Contrato de dominio para asignar un equipo a un trabajador. El id del equipo
// se recibe por separado (parámetro de ruta).
export interface AsignarEquipoDto {
  id_trabajador: number;
  // Observación o motivo de la asignación. Si se omite no se modifica la
  // observación que ya tenga el equipo.
  observaciones?: string;
}
