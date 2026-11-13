import { normalizarClave } from '@/common/domain/normalizar-clave';

/** Filtro por asignación del equipo a un trabajador. */
export enum AsignacionEquipo {
  ASIGNADOS = 'Asignados',
  SIN_ASIGNAR = 'Sin Asignar',
}

/**
 * Acepta el valor sin distinguir mayúsculas ni tildes ("sin asignar",
 * "SIN_ASIGNAR") y devuelve el valor oficial. Si no coincide con ninguno,
 * devuelve el valor original para que `@IsEnum` lo rechace.
 */
export function normalizarAsignacionEquipo(valor: unknown): unknown {
  if (typeof valor !== 'string') return valor;

  const clave = normalizarClave(valor);
  return (
    Object.values(AsignacionEquipo).find((a) => normalizarClave(a) === clave) ??
    valor
  );
}
