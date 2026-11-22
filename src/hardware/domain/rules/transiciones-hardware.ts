import { EstadoHardware } from '../enums/estado-hardware.enum';

/**
 * Transiciones de estado permitidas, por estado de origen.
 *
 * - INSTALADO -> INSTALADO solo es válido hacia otro equipo (reubicación);
 *   hacia el mismo equipo no hay cambio y se rechaza al aplicar la transición.
 * - BAJA es terminal: un hardware dado de baja o descartado no cambia más.
 */
export const TRANSICIONES_HARDWARE: Readonly<
  Record<EstadoHardware, readonly EstadoHardware[]>
> = {
  [EstadoHardware.DISPONIBLE]: [
    EstadoHardware.INSTALADO,
    EstadoHardware.EN_MANTENIMIENTO,
    EstadoHardware.BAJA,
  ],
  [EstadoHardware.INSTALADO]: [
    EstadoHardware.INSTALADO,
    EstadoHardware.DISPONIBLE,
    EstadoHardware.EN_MANTENIMIENTO,
    EstadoHardware.BAJA,
  ],
  [EstadoHardware.EN_MANTENIMIENTO]: [
    EstadoHardware.DISPONIBLE,
    EstadoHardware.INSTALADO,
    EstadoHardware.BAJA,
  ],
  [EstadoHardware.BAJA]: [],
};
