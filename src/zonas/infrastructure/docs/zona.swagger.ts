import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateZonaRequest } from '../dtos/create-zona.request';
import { UpdateZonaRequest } from '../dtos/update-zona.requets';

export function ApiZonaController() {
  return applyDecorators(ApiTags('Zonas'), ApiBearerAuth());
}

export function ApiFindAllZonas() {
  return applyDecorators(
    ApiOperation({
      summary: 'Listar zonas con filtros y paginación',
      description:
        'Obtiene el listado de zonas configuradas para la asignación de soporte in-situ y cobertura de tickets derivados.',
    }),
    ApiResponse({
      status: 200,
      description: 'Zonas encontradas correctamente.',
      schema: {
        example: {
          message: 'Zonas encontradas correctamente',
          data: [
            {
              id: 1,
              nombre_zona: 'Zona Norte - Sede Central',
              descripcion: 'Cubre los edificios A, B y C',
              is_active: true,
              createdAt: '2026-03-30T10:00:00.000Z',
            },
          ],
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: 'No autorizado / Token JWT inválido.',
    }),
  );
}

export function ApiFindAllZonasOptions() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener opciones de zonas',
      description:
        'Retorna un listado de zonas con solo los campos id_zona y nombre_zona, útil para selectores o dropdowns.',
    }),
    ApiResponse({
      status: 200,
      description: 'Opciones de zonas encontradas correctamente.',
      schema: {
        example: {
          message: 'Opciones de zonas encontradas correctamente',
          data: [
            {
              id_zona: 1,
              nombre_zona: 'Zona Norte - Sede Central',
            },
          ],
        },
      },
    }),
  );
}

export function ApiFindOneZona() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener detalle de una zona por ID',
      description: 'Retorna la información detallada de una zona específica.',
    }),
    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID numérico de la zona',
      example: 1,
    }),
    ApiResponse({
      status: 200,
      description: 'Zona encontrada correctamente.',
    }),
    ApiResponse({ status: 404, description: 'La zona solicitada no existe.' }),
    ApiResponse({
      status: 401,
      description: 'No autorizado / Token JWT inválido.',
    }),
  );
}

export function ApiCreateZona() {
  return applyDecorators(
    ApiOperation({
      summary: 'Crear una nueva zona',
      description:
        'Registra una nueva zona geográfica o lógica asignable a personal de soporte in-situ.',
    }),
    ApiBody({ type: CreateZonaRequest }),
    ApiResponse({
      status: 201,
      description: 'Zona creada correctamente.',
    }),
    ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' }),
    ApiResponse({
      status: 401,
      description: 'No autorizado / Token JWT inválido.',
    }),
  );
}

export function ApiUpdateZona() {
  return applyDecorators(
    ApiOperation({
      summary: 'Actualizar información de una zona',
      description:
        'Actualiza los datos (nombre o descripción) de una zona existente.',
    }),
    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID numérico de la zona a actualizar',
      example: 1,
    }),
    ApiBody({ type: UpdateZonaRequest }),
    ApiResponse({
      status: 200,
      description: 'Zona actualizada correctamente.',
    }),
    ApiResponse({
      status: 404,
      description: 'La zona a actualizar no existe.',
    }),
    ApiResponse({
      status: 401,
      description: 'No autorizado / Token JWT inválido.',
    }),
  );
}

export function ApiToggleZonaStatus() {
  return applyDecorators(
    ApiOperation({
      summary: 'Cambiar el estado (activo/inactivo) de una zona',
      description:
        'Permite activar o desactivar una zona. Las zonas inactivas no podrán recibir tickets derivados de in-situ.',
    }),
    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID numérico de la zona',
      example: 1,
    }),
    ApiResponse({
      status: 200,
      description: 'Estado de la zona actualizado correctamente.',
    }),
    ApiResponse({ status: 404, description: 'La zona no existe.' }),
    ApiResponse({
      status: 401,
      description: 'No autorizado / Token JWT inválido.',
    }),
  );
}
