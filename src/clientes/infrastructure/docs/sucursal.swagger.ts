import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { SucursalListItemResponseDto } from '../dtos/sucursal-list-response.dto';

const SUCURSAL_LIST_ITEM_EJEMPLO = {
  id_sucursal: 5,
  nombre_sucursal: 'Sede Miraflores',
  direccion: 'Av. Larco 345, Miraflores',
  total_areas: 3,
  is_active: true,
  // null si la sucursal no tiene cliente asignado
  cliente_empresa: {
    id_cliente: 1,
    nombre: 'Corporación ACME S.A.C.',
    numero_documento: '20123456789',
  },
  // null si no hay usuarios vinculados a la sucursal
  encargado: {
    id_usuario: 12,
    nombre: 'María',
    apellido: 'Gómez',
    telefono_contacto: '987654321',
    correo: 'maria.gomez@acme.com',
  },
  // null si la sucursal no tiene zona asignada
  zona: {
    id_zona: 2,
    nombre: 'Lima Centro',
  },
  createdAt: '2026-10-01T15:30:00.000Z',
  updatedAt: '2026-10-10T09:12:00.000Z',
};

export function ApiFindAllSucursalesSwagger() {
  return applyDecorators(
    ApiExtraModels(SucursalListItemResponseDto),
    ApiOperation({
      summary: 'Listar sucursales',
      description:
        'Retorna un listado paginado de sucursales con la empresa (`cliente_empresa`), el encargado (`encargado`), la zona y el total de áreas. Admite filtro opcional por cliente, búsqueda parcial (nombre, dirección, encargado o correo), estado activo/inactivo y paginación.',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Sucursales obtenidas exitosamente.',
      schema: {
        allOf: [
          {
            properties: {
              message: { type: 'string' },
              data: {
                type: 'object',
                properties: {
                  data: {
                    type: 'array',
                    items: { $ref: getSchemaPath(SucursalListItemResponseDto) },
                  },
                  total: { type: 'number' },
                  page: { type: 'number' },
                  limit: { type: 'number' },
                  totalPages: { type: 'number' },
                },
              },
            },
          },
        ],
        example: {
          message: 'Sucursales obtenidas exitosamente',
          data: {
            data: [SUCURSAL_LIST_ITEM_EJEMPLO],
            total: 1,
            page: 1,
            limit: 10,
            totalPages: 1,
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

export function ApiGetSucursalesOptionsSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Listar sucursales de un cliente en formato opción',
      description:
        'Retorna un listado reducido (id, nombre) de las sucursales del cliente indicado, pensado para poblar selects en el frontend.',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Opciones de sucursal obtenidas exitosamente.',
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

export function ApiFindSucursalByIdSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Obtener una sucursal por id' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Sucursal obtenida exitosamente.',
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
      description: 'La sucursal no existe.',
    }),
  );
}

export function ApiCreateSucursalSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Crear una sucursal',
      description:
        'Crea una sucursal asociada a un cliente (empresa) existente.',
    }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Sucursal creada exitosamente.',
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
      description: 'El cliente (empresa) indicado no existe.',
    }),
  );
}

export function ApiUpdateSucursalSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Actualizar una sucursal existente' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Sucursal actualizada exitosamente.',
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
      description: 'La sucursal o el cliente indicado no existen.',
    }),
  );
}

export function ApiToggleSucursalStatusSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Activar/desactivar una sucursal',
      description: 'Alterna el estado is_active de la sucursal (soft toggle).',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Estado de la sucursal actualizado exitosamente.',
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
      description: 'La sucursal no existe.',
    }),
  );
}
