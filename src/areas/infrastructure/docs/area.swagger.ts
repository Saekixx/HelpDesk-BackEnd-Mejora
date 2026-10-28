import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { CreateAreaDto } from '../../application/dtos/create-area.dto';
import { UpdateAreaDto } from '../../application/dtos/update-area.dto';

export function ApiGetAreas() {
  return applyDecorators(
    ApiOperation({ summary: 'Listar áreas con filtros y métricas' }),
    ApiQuery({ name: 'search', required: false, type: String }),
    ApiQuery({ name: 'id_empresa', required: false, type: Number }),
    ApiQuery({ name: 'id_sucursal', required: false, type: Number }),
    ApiQuery({ name: 'is_active', required: false, type: Boolean }),
    ApiQuery({ name: 'page', required: false, type: Number }),
    ApiQuery({ name: 'limit', required: false, type: Number }),
    ApiResponse({ status: 200, description: 'Lista de áreas obtenida exitosamente.' }),
    ApiResponse({ status: 401, description: 'Token JWT no válido o no enviado.' }),
    ApiResponse({ status: 403, description: 'El rol del usuario no tiene permiso administrativo.' }),
  );
}

export function ApiGetAreaOptions() {
  return applyDecorators(
    ApiOperation({ summary: 'Listar áreas de una sucursal en formato opción' }),
    ApiParam({ name: 'id', type: Number, description: 'ID de la sucursal' }),
    ApiResponse({ status: 200, description: 'Opciones de áreas obtenidas exitosamente.' }),
    ApiResponse({ status: 401, description: 'Token JWT no válido o no enviado.' }),
    ApiResponse({ status: 404, description: 'La sucursal indicada no existe.' }),
  );
}

export function ApiCreateArea() {
  return applyDecorators(
    ApiOperation({ summary: 'Crear una nueva área' }),
    ApiBody({ type: CreateAreaDto }),
    ApiResponse({ status: 201, description: 'Área creada exitosamente.' }),
    ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' }),
    ApiResponse({ status: 401, description: 'Token JWT no válido o no enviado.' }),
    ApiResponse({ status: 403, description: 'El rol del usuario no tiene permiso administrativo.' }),
    ApiResponse({ status: 404, description: 'La sucursal o empresa indicada no existen.' }),
  );
}

export function ApiGetAreaById() {
  return applyDecorators(
    ApiOperation({ summary: 'Obtener la ficha detallada de un área por su ID' }),
    ApiParam({ name: 'id', type: Number }),
    ApiResponse({ status: 200, description: 'Ficha del área encontrada exitosamente.' }),
    ApiResponse({ status: 401, description: 'Token JWT no válido o no enviado.' }),
    ApiResponse({ status: 404, description: 'El área indicada no existe.' }),
  );
}

export function ApiUpdateArea() {
  return applyDecorators(
    ApiOperation({ summary: 'Actualizar los datos de un área' }),
    ApiParam({ name: 'id', type: Number }),
    ApiBody({ type: UpdateAreaDto }),
    ApiResponse({ status: 200, description: 'Área actualizada exitosamente.' }),
    ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' }),
    ApiResponse({ status: 401, description: 'Token JWT no válido o no enviado.' }),
    ApiResponse({ status: 403, description: 'El rol del usuario no tiene permiso administrativo.' }),
    ApiResponse({ status: 404, description: 'El área o sucursal indicada no existen.' }),
  );
}

export function ApiToggleAreaStatus() {
  return applyDecorators(
    ApiOperation({ summary: 'Activar o desactivar estado de área' }),
    ApiParam({ name: 'id', type: Number, description: 'ID numérico del área a activar/desactivar' }),
    ApiResponse({ status: 200, description: 'Estado cambiado exitosamente.' }),
    ApiResponse({ status: 400, description: 'ID no válido.' }),
    ApiResponse({ status: 401, description: 'Token JWT no válido o no enviado.' }),
    ApiResponse({ status: 404, description: 'Área no encontrada.' }),
  );
}