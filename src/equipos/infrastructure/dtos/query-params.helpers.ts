// Utilidades compartidas para transformar query params de los DTOs de consulta
// de equipos (listado y opciones).

// La interfaz de usuario suele enviar los filtros vacíos como "", "null" o
// "undefined" (ej. `?id_cliente=&estado=`); se tratan como filtro omitido.
// Se lee el valor crudo (`obj[key]`) porque `enableImplicitConversion` ya
// convirtió el valor (ej. "" -> 0) antes de ejecutar el @Transform.
export const vacioAUndefined = (valor: unknown): unknown => {
  if (valor === null) return undefined;
  if (typeof valor !== 'string') return valor;
  const texto = valor.trim();
  return ['', 'null', 'undefined'].includes(texto.toLowerCase())
    ? undefined
    : texto;
};

export type TransformParams = { obj: Record<string, unknown>; key: string };

// Entero opcional: vacío -> undefined; no numérico -> NaN (lo rechaza @IsInt).
export const aEnteroOpcional = ({ obj, key }: TransformParams): unknown => {
  const valor = vacioAUndefined(obj[key]);
  return valor === undefined ? undefined : Number(valor);
};
