import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiBody,
  ApiExtraModels,
  getSchemaPath,
} from '@nestjs/swagger';
import { CreateEquipoHttpDto } from '../dtos/create-equipo-http.dto';
import { AsignarEquipoHttpDto } from '../dtos/asignar-equipo-http.dto';
import { AgregarComponenteHttpDto } from '../dtos/agregar-componente-http.dto';
import { ReemplazarComponenteHttpDto } from '../dtos/reemplazar-componente-http.dto';
import { EquipoDetailResponseDto } from '../dtos/equipo-detail-response.dto';
import { EquipoEstadisticasResponseDto } from '../dtos/equipo-estadisticas-response.dto';

const EQUIPO_EJEMPLO = {
  id_equipo: 1,
  tipo: 'Laptop',
  marca: 'Dell',
  nombre_equipo: 'PC-Contabilidad-01',
  num_serie: 'SN-2026-00123',
  nombre_usuario: 'Carlos Ramírez',
  id_trabajador: 5,
  id_cliente: 1,
  id_sucursal: 1,
  id_area: 1,
  is_active: true,
};

const COMPONENTE_EJEMPLO = {
  id_RH: 12,
  tipo: 'Memoria RAM',
  marca: 'Kingston',
  descripcion: 'Ampliación de memoria RAM solicitada por el usuario',
  serie: 'SN-RAM-2026-00456',
  proveedor: 'Tecnoglobal S.A.C.',
  fecha_instalacion: '2026-09-29T15:30:00.000Z',
  url_factura: null,
  is_active: true,
};

// Relaciones del listado (GET /equipos): campos completos; trabajador es null
// si el equipo no está asignado.
const RELACIONES_LISTADO_EJEMPLO = {
  cliente: { id_cliente: 1, nombre_principal: 'Acme Corp SAC' },
  sucursal: { id_sucursal: 1, nombre_sucursal: 'Sucursal Central' },
  area: { id_area: 1, nombre_area: 'Sistemas' },
  trabajador: {
    id_usuario: 5,
    nombre: 'Juan',
    apellido: 'Pérez',
    correo: 'juan.perez@acme.com',
  },
};

export function ApiFindAllEquiposSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Listar equipos',
      description:
        'Retorna un listado paginado de equipos. Filtros opcionales: `search` (nombre del equipo, número de serie, marca/modelo o nombre/apellido del trabajador), `id_cliente`, `id_sucursal`, `id_area`, `estado` (Activo | En_Almacen | En_Mantenimiento | Retirado), `asignacion` (Asignados | Sin Asignar), `page` y `limit`. Cada item incluye `estado` y las relaciones `cliente`, `sucursal`, `area` y `trabajador` (null si no está asignado) con sus campos completos.',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Equipos obtenidos exitosamente.',
      schema: {
        example: {
          message: 'Equipos obtenidos exitosamente',
          data: {
            data: [
              {
                ...EQUIPO_EJEMPLO,
                estado: 'Activo',
                ...RELACIONES_LISTADO_EJEMPLO,
              },
            ],
            meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Token inválido, expirado o ausente.',
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'El rol del usuario no tiene permiso de lectura.',
    }),
  );
}

// Body de ejemplo de GET /equipos/:id (Hoja de Vida del Equipo).
const EQUIPO_DETALLE_EJEMPLO = {
  id_equipo: 3,
  nombre_equipo: 'PC-DELL-90',
  tipo: 'Desktop',
  marca_modelo: 'Dell Latitude 5540',
  estado: 'Activo',
  num_serie: 'SN-2026-00123',
  ult_revision: '2026-09-01T00:00:00.000Z',
  rev_programada: '2027-03-01T00:00:00.000Z',
  is_active: true,
  created_at: '2026-11-01T15:00:00.000Z',
  updated_at: '2026-11-10T09:30:00.000Z',
  cliente: { id_cliente: 1, nombre_principal: 'Innovación Global Tech' },
  sucursal: {
    id_sucursal: 1,
    nombre_sucursal: 'Sucursal Centro Civico',
    direccion: 'Av. Garcilaso de la Vega 1234, Lima',
    encargado: 'Ana Torres',
  },
  area: { id_area: 1, nombre_area: 'Sistemas y TI' },
  trabajador: {
    id_usuario: 5,
    nombre: 'María',
    apellido: 'Vargas',
    correo: 'maria.sucursal2@empresa1.com',
    telefono: '987654321',
  },
  hardware: {
    componentes_actuales: [
      {
        id_RH: 11,
        id_hardware: 7,
        tipo_componente: 'MEMORIA_RAM',
        marca_modelo: 'Kingston Fury 16GB',
        numero_serie: 'SN-9876543210',
        proveedor: 'TechSupply Peru S.A.C.',
        url_factura: 'https://storage.empresa.com/facturas/fac-001.pdf',
        salud_smart: 'OK',
        motivo_instalacion: 'Ampliación de memoria por lentitud del equipo',
        fecha_instalacion: '2026-10-01T10:30:00.000Z',
        tecnico_responsable: {
          id_usuario: 9,
          nombre: 'Luis',
          apellido: 'Soto',
        },
        is_active: true,
      },
    ],
    historial: [
      {
        id_RH: 6,
        id_hardware: 4,
        tipo_componente: 'MEMORIA_RAM',
        marca_modelo: 'Generic 8GB',
        numero_serie: 'SN-1100234988',
        proveedor: 'TechSupply Peru S.A.C.',
        fecha_instalacion: '2026-03-15T09:00:00.000Z',
        fecha_retiro: '2026-10-01T10:30:00.000Z',
        motivo_retiro: 'Falla detectada en pruebas de memoria',
        tecnico_responsable: {
          id_usuario: 9,
          nombre: 'Luis',
          apellido: 'Soto',
        },
        is_active: false,
      },
    ],
  },
  software: [
    {
      id_software_equipos: 4,
      id_software: 2,
      nombre_software: 'Microsoft Office 365',
      categoria: 'Ofimática',
      tipo_licencia: 'Pool_Limitado',
      licencia_asignada: 'XXXXX-XXXXX-XXXXX',
      correo_asociado: 'licencias@empresa1.com',
      password_enc: '**********',
      fecha_instalacion: '2026-10-02T08:00:00.000Z',
      vencimiento: '2027-01-01T00:00:00.000Z',
      observaciones: 'Licencia renovada anualmente',
      is_active: true,
    },
  ],
};

export function ApiFindEquipoByIdSwagger() {
  return applyDecorators(
    ApiExtraModels(EquipoDetailResponseDto),
    ApiOperation({
      summary: 'Obtener la hoja de vida de un equipo por id',
      description:
        'Retorna el equipo con su cliente, sucursal (dirección y encargado), área y trabajador asignado; el hardware separado en `componentes_actuales` (con motivo de instalación) e `historial` de componentes retirados; y las licencias de software asignadas. Solo el ADMINISTRADOR recibe `password_enc` de las licencias; para los demás roles viene enmascarada como `**********`.',
    }),
    ApiParam({
      name: 'id',
      description: 'ID numérico del equipo',
      example: 3,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Equipo obtenido exitosamente.',
      schema: {
        properties: {
          status: { type: 'number', example: HttpStatus.OK },
          message: {
            type: 'string',
            example: 'Equipo obtenido exitosamente',
          },
          data: { $ref: getSchemaPath(EquipoDetailResponseDto) },
        },
        example: {
          status: HttpStatus.OK,
          message: 'Equipo obtenido exitosamente',
          data: EQUIPO_DETALLE_EJEMPLO,
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'El id enviado no es un número válido.',
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Token inválido, expirado o ausente.',
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'El rol del usuario no tiene permiso de lectura.',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'El equipo no existe.',
    }),
  );
}

// Bodies de ejemplo de POST /equipos.
const CREAR_EQUIPO_CON_TRABAJADOR_EJEMPLO = {
  nombre_equipo: 'PC-DELL-90',
  num_serie: 'SN-2026-00123',
  tipo: 'Desktop',
  marca_modelo: 'Dell Latitude 5540',
  id_cliente: 1,
  id_sucursal: 1,
  id_area: 1,
  id_trabajador: 5,
};
const CREAR_EQUIPO_SIN_TRABAJADOR_EJEMPLO = {
  nombre_equipo: 'LAP-HP-12',
  num_serie: 'SN-2026-00456',
  tipo: 'Laptop',
  marca_modelo: 'HP ProBook 450 G9',
  id_cliente: 1,
  id_sucursal: 1,
  id_area: 1,
};

// Equipo recién registrado (POST /equipos). Sin trabajador: `trabajador` es
// null y `estado` es "En_Almacen".
const EQUIPO_CREADO_EJEMPLO = {
  id_equipo: 3,
  nombre_equipo: 'PC-DELL-90',
  tipo: 'Desktop',
  marca_modelo: 'Dell Latitude 5540',
  num_serie: 'SN-2026-00123',
  estado: 'Activo',
  ult_revision: null,
  rev_programada: null,
  cliente: { id_cliente: 1, nombre_principal: 'Innovación Global Tech' },
  sucursal: { id_sucursal: 1, nombre_sucursal: 'Sucursal Centro Civico' },
  area: { id_area: 1, nombre_area: 'Sistemas y TI' },
  trabajador: {
    id_usuario: 5,
    nombre: 'María',
    apellido: 'Vargas',
    correo: 'maria.sucursal2@empresa1.com',
  },
  created_at: '2026-11-16T19:30:00.000Z',
};

export function ApiCreateEquipoSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Registrar un equipo',
      description:
        'Registra un equipo con su ubicación (cliente, sucursal y área) y, opcionalmente, un trabajador asignado. Valida que la sucursal pertenezca al cliente, el área a la sucursal y el trabajador al cliente. El estado se asigna automáticamente: `Activo` si se envía `id_trabajador`, `En_Almacen` si no (en ese caso `trabajador` es null en la respuesta).',
    }),
    ApiBody({
      type: CreateEquipoHttpDto,
      examples: {
        conTrabajador: {
          summary: 'Con trabajador asignado (estado Activo)',
          value: CREAR_EQUIPO_CON_TRABAJADOR_EJEMPLO,
        },
        sinTrabajador: {
          summary: 'Sin trabajador (estado En_Almacen)',
          value: CREAR_EQUIPO_SIN_TRABAJADOR_EJEMPLO,
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Equipo creado exitosamente.',
      schema: {
        example: {
          status: HttpStatus.CREATED,
          message: 'Equipo creado exitosamente',
          data: EQUIPO_CREADO_EJEMPLO,
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description:
        'Datos inválidos o jerarquía incorrecta: la sucursal no pertenece al cliente, el área no pertenece a la sucursal o el trabajador no pertenece al cliente.',
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Token inválido, expirado o ausente.',
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'El rol del usuario no tiene permiso administrativo.',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description:
        'El cliente, la sucursal, el área o el trabajador no existen o están inactivos.',
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'El número de serie ya está registrado en otro equipo.',
    }),
  );
}

export function ApiToggleEquipoStatusSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Activar/desactivar un equipo',
      description: 'Alterna el estado is_active del equipo (soft toggle).',
    }),
    ApiParam({
      name: 'id',
      description: 'ID numérico del equipo a activar/desactivar',
      example: 1,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Estado del equipo actualizado exitosamente.',
      schema: {
        example: {
          message: 'Estado del equipo actualizado exitosamente',
          data: { ...EQUIPO_EJEMPLO, is_active: false },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Token inválido, expirado o ausente.',
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'El rol del usuario no tiene permiso administrativo.',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'El equipo no existe.',
    }),
  );
}

const ROLES_ASIGNACION =
  'El rol del usuario no puede liberar ni asignar equipos (se permite a ADMINISTRADOR, SOPORTE_TECNICO y SOPORTE_INSITU).';

export function ApiLiberarEquipoSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Liberar un equipo',
      description:
        'Desvincula al trabajador del equipo (`id_trabajador = null`) y lo deja en estado `En_Almacen`. No recibe body. Liberar un equipo que ya está libre no produce error.',
    }),
    ApiParam({
      name: 'id',
      description: 'ID numérico del equipo a liberar',
      example: 1,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Equipo liberado exitosamente.',
      schema: {
        example: {
          status: HttpStatus.OK,
          message: 'Equipo liberado exitosamente',
          data: null,
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'El ID del equipo no es un número válido.',
      schema: {
        example: {
          status: HttpStatus.BAD_REQUEST,
          message: 'Validation failed (numeric string is expected)',
          data: null,
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Token inválido, expirado o ausente.',
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: ROLES_ASIGNACION,
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'El equipo no existe.',
      schema: {
        example: {
          status: HttpStatus.NOT_FOUND,
          message: 'Equipo no encontrado',
          data: null,
        },
      },
    }),
  );
}

export function ApiAsignarEquipoSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Asignar un equipo a un trabajador',
      description:
        'Asigna el equipo al trabajador indicado, lo deja en estado `Activo` y guarda las observaciones si se envían (si se omiten, la observación actual no cambia). El trabajador debe existir, estar activo y pertenecer al mismo cliente del equipo; el equipo debe estar activo.',
    }),
    ApiParam({
      name: 'id',
      description: 'ID numérico del equipo a asignar',
      example: 1,
    }),
    ApiBody({
      type: AsignarEquipoHttpDto,
      examples: {
        conObservaciones: {
          summary: 'Asignación con observaciones',
          value: {
            id_trabajador: 5,
            observaciones: 'Entrega de laptop por ingreso a contabilidad',
          },
        },
        sinObservaciones: {
          summary: 'Asignación sin observaciones',
          value: { id_trabajador: 5 },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Equipo asignado exitosamente.',
      schema: {
        example: {
          status: HttpStatus.OK,
          message: 'Equipo asignado exitosamente',
          data: null,
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description:
        'Datos inválidos (ID del equipo no numérico, `id_trabajador` ausente o no entero, observaciones que superan 500 caracteres, propiedades no permitidas) o el trabajador pertenece a otro cliente.',
      content: {
        'application/json': {
          examples: {
            validacion: {
              summary: 'Falta id_trabajador',
              value: {
                status: HttpStatus.BAD_REQUEST,
                message:
                  'El ID del trabajador debe ser mayor o igual a 1, El ID del trabajador debe ser un número entero, El ID del trabajador es obligatorio',
                data: null,
              },
            },
            otroCliente: {
              summary: 'Trabajador de otro cliente',
              value: {
                status: HttpStatus.BAD_REQUEST,
                message:
                  'El trabajador seleccionado no pertenece al cliente indicado',
                data: null,
              },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Token inválido, expirado o ausente.',
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: ROLES_ASIGNACION,
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description:
        'El equipo no existe, o el trabajador no existe o está inactivo.',
      content: {
        'application/json': {
          examples: {
            equipo: {
              summary: 'Equipo no encontrado',
              value: {
                status: HttpStatus.NOT_FOUND,
                message: 'Equipo no encontrado',
                data: null,
              },
            },
            trabajador: {
              summary: 'Trabajador no disponible',
              value: {
                status: HttpStatus.NOT_FOUND,
                message: 'El trabajador asignado no existe o está inactivo',
                data: null,
              },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'El equipo está desactivado y no se puede asignar.',
      schema: {
        example: {
          status: HttpStatus.CONFLICT,
          message: 'El equipo está desactivado y no se puede asignar',
          data: null,
        },
      },
    }),
  );
}

export function ApiAgregarComponenteEquipoSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Agregar un componente de hardware a un equipo',
      description:
        'Asocia un componente de hardware existente al equipo y lo registra como componente actual en el historial de hardware, con la fecha de instalación en el momento de la solicitud.',
    }),
    ApiParam({
      name: 'id',
      description: 'ID numérico del equipo al que se agrega el componente',
      example: 1,
    }),
    ApiBody({ type: AgregarComponenteHttpDto }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Componente agregado exitosamente.',
      schema: {
        example: {
          message: 'Componente agregado exitosamente',
          data: COMPONENTE_EJEMPLO,
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Datos de entrada inválidos.',
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Token inválido, expirado o ausente.',
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'El rol del usuario no tiene permiso administrativo.',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'El equipo o el componente de hardware no existe.',
    }),
  );
}

export function ApiReemplazarComponenteEquipoSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Reemplazar un componente de hardware de un equipo',
      description:
        'Reemplaza de forma transaccional un componente actual del equipo: el registro saliente pasa al historial (is_actual = false) y se crea el nuevo componente como actual, con la fecha de instalación en el momento de la solicitud. Si algo falla, no se aplica ningún cambio.',
    }),
    ApiParam({
      name: 'id',
      description: 'ID numérico del equipo cuyo componente se reemplaza',
      example: 1,
    }),
    ApiBody({ type: ReemplazarComponenteHttpDto }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Componente reemplazado exitosamente.',
      schema: {
        example: {
          message: 'Componente reemplazado exitosamente',
          data: COMPONENTE_EJEMPLO,
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Datos de entrada inválidos.',
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Token inválido, expirado o ausente.',
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'El rol del usuario no tiene permiso administrativo.',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description:
        'El equipo o el hardware nuevo no existe, o el componente saliente no está instalado actualmente en el equipo.',
    }),
  );
}

// Items de ejemplo de GET /equipos/options (EquipoOptionItem). Los campos
// opcionales pueden venir en null (ej. un equipo sin nombre ni número de serie).
const EQUIPO_OPTIONS_EJEMPLO = [
  {
    id_equipo: 1,
    nombre_equipo: 'PC-Contabilidad-01',
    num_serie: 'SN-2026-00123',
    tipo: 'Laptop',
    marca_modelo: 'Dell Latitude 5420',
    estado: 'Activo',
  },
  {
    id_equipo: 2,
    nombre_equipo: 'Laptop-Soporte-02',
    num_serie: 'SN-2026-00456',
    tipo: 'Laptop',
    marca_modelo: 'Lenovo ThinkPad T14',
    estado: 'En_Mantenimiento',
  },
  {
    id_equipo: 3,
    nombre_equipo: null,
    num_serie: null,
    tipo: 'Servidor',
    marca_modelo: null,
    estado: 'En_Almacen',
  },
];

export function ApiGetEquipoOptionsSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener opciones de equipos para selectores',
      description:
        'Devuelve un listado ligero (sin paginación) de los equipos activos, ordenado por nombre, para alimentar desplegables y selectores en cascada del frontend. Todos los filtros son opcionales y combinables: `id_cliente`, `id_sucursal`, `id_area`, `estado` (Activo | En_Almacen | En_Mantenimiento | Retirado; acepta también la etiqueta, ej. "En Almacén") y `search` (búsqueda parcial por nombre del equipo, número de serie o marca/modelo). Los filtros vacíos ("", "null" o "undefined") se ignoran. Los equipos dados de baja no se listan.',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description:
        'Opciones de equipos obtenidas exitosamente. Retorna un arreglo vacío si ningún equipo coincide con los filtros.',
      schema: {
        example: {
          status: HttpStatus.OK,
          message: 'Opciones de equipos obtenidas exitosamente',
          data: EQUIPO_OPTIONS_EJEMPLO,
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description:
        'Algún filtro es inválido (id no entero positivo, estado desconocido o búsqueda demasiado larga).',
      schema: {
        example: {
          status: HttpStatus.BAD_REQUEST,
          message: [
            'El estado debe ser uno de: Activo, En_Almacen, En_Mantenimiento, Retirado',
          ],
          data: null,
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Token inválido, expirado o ausente.',
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'El rol del usuario no tiene permiso de lectura.',
    }),
  );
}

// Ejemplo de KPI: asignados + sin_asignar = total_equipos.
const EQUIPO_ESTADISTICAS_EJEMPLO = {
  total_equipos: 1294,
  asignados: 1148,
  sin_asignar: 146,
};

export function ApiGetEquipoEstadisticasSwagger() {
  return applyDecorators(
    ApiExtraModels(EquipoEstadisticasResponseDto),
    ApiOperation({
      summary: 'Obtener estadísticas del inventario de equipos',
      description:
        'Retorna el conteo global de equipos activos registrados (`total_equipos`), de los asignados a un trabajador (`asignados`) y de los que no tienen trabajador (`sin_asignar`); `asignados` + `sin_asignar` equivale a `total_equipos`. Los equipos dados de baja no se cuentan. No acepta filtros ni paginación. Alimenta las tarjetas KPI de la cabecera del módulo de Inventario de Equipos.',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description:
        'Estadísticas del inventario de equipos obtenidas exitosamente.',
      schema: {
        type: 'object',
        properties: {
          status: { type: 'number', example: HttpStatus.OK },
          message: {
            type: 'string',
            example:
              'Estadísticas del inventario de equipos obtenidas exitosamente',
          },
          data: { $ref: getSchemaPath(EquipoEstadisticasResponseDto) },
        },
        example: {
          status: HttpStatus.OK,
          message:
            'Estadísticas del inventario de equipos obtenidas exitosamente',
          data: EQUIPO_ESTADISTICAS_EJEMPLO,
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Token inválido, expirado o ausente.',
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'El rol del usuario no tiene permiso de lectura.',
    }),
  );
}
