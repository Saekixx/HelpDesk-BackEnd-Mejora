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

export function ApiFindAllEquiposSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Listar equipos',
      description:
        'Retorna un listado paginado de equipos, con filtro opcional por cliente, sucursal, texto de búsqueda y estado activo/inactivo.',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Equipos obtenidos exitosamente.',
      schema: {
        example: {
          message: 'Equipos obtenidos exitosamente',
          data: {
            data: [{ ...EQUIPO_EJEMPLO, ...RELACIONES_EJEMPLO }],
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

export function ApiCreateEquipoSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Registrar un equipo',
      description:
        'Registra un nuevo equipo, opcionalmente asociado a un cliente, sucursal, área y trabajador.',
    }),
    ApiBody({ type: CreateEquipoHttpDto }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Equipo creado exitosamente.',
      schema: {
        example: {
          message: 'Equipo creado exitosamente',
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
      status: HttpStatus.CONFLICT,
      description: 'Ya existe un equipo con ese número de serie.',
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
