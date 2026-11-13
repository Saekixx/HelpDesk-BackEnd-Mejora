import { normalizarClave } from '@/common/domain/normalizar-clave';

/**
 * Estados posibles de un equipo. Los valores coinciden con las claves del enum
 * `equipos_estado` de Prisma (columna `equipos.estado`), por lo que son
 * intercambiables en las consultas.
 */
export enum EstadoEquipo {
  ACTIVO = 'Activo',
  EN_ALMACEN = 'En_Almacen',
  EN_MANTENIMIENTO = 'En_Mantenimiento',
  RETIRADO = 'Retirado',
}

/**
 * Acepta la clave ("En_Almacen") o la etiqueta ("En Almacén"), sin distinguir
 * mayúsculas ni tildes, y devuelve la clave. Si no coincide con ninguna,
 * devuelve el valor original para que `@IsEnum` lo rechace.
 */
export function normalizarEstadoEquipo(valor: unknown): unknown {
  if (typeof valor !== 'string') return valor;

  const clave = normalizarClave(valor);
  return (
    Object.values(EstadoEquipo).find((e) => normalizarClave(e) === clave) ??
    valor
  );
}
