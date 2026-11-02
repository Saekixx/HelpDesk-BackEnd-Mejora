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

/**
 * Acepta tanto la clave del enum ("EN_MANTENIMIENTO") como la etiqueta
 * ("En Mantenimiento"), sin distinguir mayúsculas, y devuelve la clave.
 * Si no coincide con ninguna, devuelve el valor original para que la
 * validación `@IsEnum` lo rechace con su mensaje.
 */
export function normalizarEstadoHardware(valor: unknown): unknown {
  if (typeof valor !== 'string') return valor;

  const texto = valor.trim().toLowerCase();
  const estado = Object.values(EstadoHardware).find(
    (clave) =>
      clave.toLowerCase() === texto ||
      ESTADO_HARDWARE_LABEL[clave].toLowerCase() === texto,
  );

  return estado ?? valor;
}
