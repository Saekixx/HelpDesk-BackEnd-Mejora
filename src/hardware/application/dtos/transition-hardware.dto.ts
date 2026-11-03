import { EstadoHardware } from '@/hardware/domain/enums/estado-hardware.enum';

/**
 * Datos para cambiar el estado de un hardware (PATCH /hardware/:id/transition).
 * Cada transición deja trazabilidad con el `motivo` de la intervención.
 * La validación HTTP vive en `TransitionHardwareRequestDto` (infrastructure).
 */
export interface TransitionHardwareDto {
  // Estado destino al que pasa el hardware.
  estado: EstadoHardware;
  // Equipo donde se instala. Obligatorio solo cuando estado = INSTALADO.
  id_equipo?: number;
  // Observación de la intervención, para la hoja de vida del componente.
  motivo: string;
}
