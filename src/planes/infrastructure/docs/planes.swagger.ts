import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { CreatePlanRequestDto } from '../dtos/create-plan.request.dto';
import { UpdatePlanRequestDto } from '../dtos/update-plan.request.dto';

export const ApiPlanesTag = () => ApiTags('Planes');

export const ApiFindAllPlanesSwagger = () =>
  applyDecorators(
    ApiOperation({ summary: 'Listar todos los planes' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Lista de planes obtenida exitosamente.',
    }),
  );

export const ApiFindByIdPlanSwagger = () =>
  applyDecorators(
    ApiOperation({ summary: 'Obtener plan por ID' }),
    ApiParam({ name: 'id', type: Number, description: 'ID numérico del plan' }),
    ApiResponse({ status: HttpStatus.OK, description: 'Plan encontrado.' }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Plan no encontrado.',
    }),
  );

export const ApiCreatePlanSwagger = () =>
  applyDecorators(
    ApiOperation({ summary: 'Crear un nuevo plan' }),
    ApiBody({ type: CreatePlanRequestDto }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Plan creado exitosamente.',
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Datos de entrada inválidos.',
    }),
  );

export const ApiUpdatePlanSwagger = () =>
  applyDecorators(
    ApiOperation({ summary: 'Actualizar un plan existente' }),
    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID del plan a actualizar',
    }),
    ApiBody({ type: UpdatePlanRequestDto }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Plan actualizado exitosamente.',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Plan no encontrado.',
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Datos de entrada inválidos.',
    }),
  );

export const ApiTogglePlanStatusSwagger = () =>
  applyDecorators(
    ApiOperation({ summary: 'Alternar estado del plan (Activo/Inactivo)' }),
    ApiParam({ name: 'id', type: Number, description: 'ID del plan' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Estado actualizado correctamente.',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Plan no encontrado.',
    }),
  );
