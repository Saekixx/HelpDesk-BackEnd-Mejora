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
import { UpdateEquipoHttpDto } from '../dtos/update-equipo-http.dto';
import { AgregarComponenteHttpDto } from '../dtos/agregar-componente-http.dto';
import { ReemplazarComponenteHttpDto } from '../dtos/reemplazar-componente-http.dto';
import { EquipoDetailResponseDto } from '../dtos/equipo-detail-response.dto';

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

// Relaciones resumidas que devuelven el listado, la creación y la edición.
const RELACIONES_EJEMPLO = {
  cliente: { id: 1, nombre: 'Acme Corp SAC' },
  sucursal: { id: 1, nombre: 'Sucursal Central' },
  area: { id: 1, nombre: 'Sistemas' },
  trabajador: { id: 5, nombre: 'Juan Pérez' },
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

export function ApiFindEquipoByIdSwagger() {
  return applyDecorators(
    ApiExtraModels(EquipoDetailResponseDto),
    ApiOperation({
      summary: 'Obtener el detalle de un equipo por id',
      description:
        'Retorna el equipo con sus relaciones (cliente, sucursal, área, trabajador), los componentes de hardware separados en actuales e historial, y el software instalado. Alimenta la vista de detalle del equipo en el frontend.',
    }),
    ApiParam({
      name: 'id',
      description: 'ID numérico del equipo',
      example: 1,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Equipo obtenido exitosamente.',
      schema: {
        allOf: [
          {
            properties: {
              message: {
                type: 'string',
                example: 'Equipo obtenido exitosamente',
              },
              data: { $ref: getSchemaPath(EquipoDetailResponseDto) },
            },
          },
        ],
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

export function ApiUpdateEquipoSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Actualizar un equipo existente' }),
    ApiParam({
      name: 'id',
      description: 'ID numérico del equipo a actualizar',
      example: 1,
    }),
    ApiBody({ type: UpdateEquipoHttpDto }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Equipo actualizado exitosamente.',
      schema: {
        example: {
          message: 'Equipo actualizado exitosamente',
          data: { ...EQUIPO_EJEMPLO, ...RELACIONES_EJEMPLO },
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
      description: 'El equipo no existe.',
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'Ya existe un equipo con ese número de serie.',
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
