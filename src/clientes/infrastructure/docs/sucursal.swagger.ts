import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function ApiFindAllSucursalesSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Listar sucursales',
      description:
        'Retorna un listado paginado de sucursales, con filtro opcional por cliente, texto de búsqueda y estado activo/inactivo.',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Sucursales obtenidas exitosamente.',
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
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'La sucursal no existe.' }),
  );
}

export function ApiCreateSucursalSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Crear una sucursal',
      description:
        'Crea una sucursal asociada a un cliente (empresa) existente.',
    }),
    ApiResponse({ status: HttpStatus.CREATED, description: 'Sucursal creada exitosamente.' }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Datos de entrada inválidos.' }),
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
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Datos de entrada inválidos.' }),
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
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'La sucursal no existe.' }),
  );
}