/**
 * Tipos de componente de hardware aceptados por el sistema.
 * Las claves coinciden con el enum `TipoComponente` de Prisma
 * (columna `hardware.tipo_componente`); en BD se guarda el texto del `@map`.
 */
export enum TipoComponente {
  MEMORIA_RAM = 'MEMORIA_RAM',
  ALMACENAMIENTO_SSD = 'ALMACENAMIENTO_SSD',
  ALMACENAMIENTO_HDD = 'ALMACENAMIENTO_HDD',
  FUENTE_PODER = 'FUENTE_PODER',
  PROCESADOR = 'PROCESADOR',
  TARJETA_GRAFICA = 'TARJETA_GRAFICA',
  PLACA_BASE = 'PLACA_BASE',
}

/** Etiquetas legibles (mismo texto del `@map` de Prisma y del modal del frontend). */
export const TIPO_COMPONENTE_LABEL: Record<TipoComponente, string> = {
  [TipoComponente.MEMORIA_RAM]: 'Memoria RAM',
  [TipoComponente.ALMACENAMIENTO_SSD]: 'Almacenamiento SSD/NVMe',
  [TipoComponente.ALMACENAMIENTO_HDD]: 'Almacenamiento HDD',
  [TipoComponente.FUENTE_PODER]: 'Fuente de Poder (PSU)',
  [TipoComponente.PROCESADOR]: 'Procesador (CPU)',
  [TipoComponente.TARJETA_GRAFICA]: 'Tarjeta Gráfica (GPU)',
  [TipoComponente.PLACA_BASE]: 'Placa Base',
};

/**
 * Acepta tanto la clave del enum ("MEMORIA_RAM") como la etiqueta que muestra
 * el modal ("Memoria RAM"), sin distinguir mayúsculas, y devuelve la clave.
 * Si no coincide con ninguna, devuelve el valor original para que la
 * validación `@IsEnum` lo rechace con su mensaje.
 */
export function normalizarTipoComponente(valor: unknown): unknown {
  if (typeof valor !== 'string') return valor;

  const texto = valor.trim().toLowerCase();
  const tipo = Object.values(TipoComponente).find(
    (clave) =>
      clave.toLowerCase() === texto ||
      TIPO_COMPONENTE_LABEL[clave].toLowerCase() === texto,
  );

  return tipo ?? valor;
}
