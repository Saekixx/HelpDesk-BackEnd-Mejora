/**
 * Destino inicial de un hardware recién registrado.
 * - ALMACEN_CENTRAL: queda DISPONIBLE, sin equipo asignado.
 * - INSTALAR_EQUIPO: se instala en `id_equipo_destino` y queda INSTALADO.
 */
export enum UbicacionInicial {
  ALMACEN_CENTRAL = 'ALMACEN_CENTRAL',
  INSTALAR_EQUIPO = 'INSTALAR_EQUIPO',
}
