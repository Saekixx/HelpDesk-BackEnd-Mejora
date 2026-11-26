// Utilidades compartidas para transformar textos del body en los DTOs HTTP de
// componentes de equipos.

// Texto requerido sin espacios al inicio ni al final (otros tipos pasan sin
// cambios para que los rechace el validador correspondiente).
export const recortar = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

// Texto opcional sin espacios al inicio ni al final; si queda vacío se trata
// como ausente (undefined) para que @IsOptional lo omita. Otros tipos pasan
// sin cambios para que los rechace el validador correspondiente.
export const recortarOUndefined = ({ value }: { value: unknown }): unknown => {
  if (typeof value !== 'string') return value;
  const texto = value.trim();
  return texto === '' ? undefined : texto;
};
