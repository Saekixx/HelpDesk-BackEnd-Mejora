import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';

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
  );
}

export function ApiGetAreaOptions() {
  return applyDecorators(
    ApiOperation({ summary: 'Listar áreas de una sucursal en formato opción' }),
    ApiParam({ name: 'id', type: Number, description: 'ID de la sucursal' }),
    ApiResponse({ status: 200, description: 'Opciones de áreas obtenidas exitosamente.' }),
  );
}

export function ApiCreateArea() {
  return applyDecorators(
    ApiOperation({ summary: 'Crear una nueva área' }),
    ApiResponse({ status: 201, description: 'Área creada exitosamente.' }),
    ApiResponse({ status: 400, description: 'Datos inválidos.' }),
  );
}

export function ApiGetAreaById() {
  return applyDecorators(
    ApiOperation({ summary: 'Obtener la ficha detallada de un área por su ID' }),
    ApiParam({ name: 'id', type: Number }),
    ApiResponse({ status: 200, description: 'Ficha del área encontrada.' }),
    ApiResponse({ status: 404, description: 'Área no encontrada.' }),
  );
}

export function ApiUpdateArea() {
  return applyDecorators(
    ApiOperation({ summary: 'Actualizar los datos de un área' }),
    ApiParam({ name: 'id', type: Number }),
    ApiResponse({ status: 200, description: 'Área actualizada exitosamente.' }),
  );
}

export function ApiToggleAreaStatus() {
  return applyDecorators(
    ApiOperation({ summary: 'Activar/desactivar un área (Toggle status)' }),
    ApiParam({ name: 'id', type: Number }),
    ApiResponse({ status: 200, description: 'Estado del área actualizado exitosamente.' }),
  );
}