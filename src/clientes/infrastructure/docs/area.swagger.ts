import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function ApiFindAllAreasSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Listar áreas',
      description:
        'Retorna un listado paginado de áreas, con filtro opcional por cliente (a través de la sucursal), sucursal, texto de búsqueda y estado activo/inactivo.',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Áreas obtenidas exitosamente.',
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

export function ApiGetAreasOptionsSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Listar áreas de una sucursal en formato opción',
      description:
        'Retorna un listado reducido (id, nombre) de las áreas de la sucursal indicada, pensado para poblar selects en el frontend.',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Opciones de área obtenidas exitosamente.',
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

export function ApiFindAreaByIdSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Obtener un área por id' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Área obtenida exitosamente.',
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Token inválido, expirado o ausente.',
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'El rol del usuario no tiene permiso de lectura.',
    }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'El área no existe.' }),
  );
}

export function ApiCreateAreaSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Crear un área',
      description: 'Crea un área asociada a una sucursal existente.',
    }),
    ApiResponse({ status: HttpStatus.CREATED, description: 'Área creada exitosamente.' }),
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
      description: 'La sucursal indicada no existe.',
    }),
  );
}

export function ApiUpdateAreaSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Actualizar un área existente' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Área actualizada exitosamente.',
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
      description: 'El área o la sucursal indicada no existen.',
    }),
  );
}

export function ApiToggleAreaStatusSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Activar/desactivar un área',
      description: 'Alterna el estado is_active del área (soft toggle).',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Estado del área actualizado exitosamente.',
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Token inválido, expirado o ausente.',
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'El rol del usuario no tiene permiso administrativo.',
    }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'El área no existe.' }),
  );
}