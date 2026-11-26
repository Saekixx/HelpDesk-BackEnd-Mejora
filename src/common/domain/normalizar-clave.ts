/**
 * Convierte un texto a una clave comparable: sin tildes, en minúsculas y con
 * guiones bajos en lugar de espacios ("En Almacén" -> "en_almacen").
 */
export function normalizarClave(texto: string): string {
  return texto
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_');
}
