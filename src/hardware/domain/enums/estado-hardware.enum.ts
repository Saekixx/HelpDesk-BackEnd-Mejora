/**
 * Estados posibles de un componente de hardware.
 * Los valores coinciden con el enum `EstadoHardware` de Prisma
 * (columna `hardware.estado`), por lo que son intercambiables en las consultas.
 */
export enum EstadoHardware {
  INSTALADO = 'INSTALADO',
  DISPONIBLE = 'DISPONIBLE',
  EN_MANTENIMIENTO = 'EN_MANTENIMIENTO',
  BAJA = 'BAJA',
}

/** Etiquetas legibles que se guardan en BD y se muestran en el frontend. */
export const ESTADO_HARDWARE_LABEL: Record<EstadoHardware, string> = {
  [EstadoHardware.INSTALADO]: 'Instalado',
  [EstadoHardware.DISPONIBLE]: 'Disponible',
  [EstadoHardware.EN_MANTENIMIENTO]: 'En Mantenimiento',
  [EstadoHardware.BAJA]: 'Baja / Descarte',
};
