import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { CreateHardwareRequestDto } from '../dtos/create-hardware.request.dto';
import { UpdateHardwareRequestDto } from '../dtos/update-hardware.request.dto';

export const ApiHardwareTag = () => ApiTags('Hardware');

export const ApiFindAllHardwareSwagger = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Listar todos los equipos de hardware con filtros y paginación',
    }),
    ApiQuery({
      name: 'search',
      required: false,
      type: String,
      description: 'Buscar por tipo, marca, número de serie o proveedor',
    }),
    ApiQuery({
      name: 'tipo',
      required: false,
      type: String,
      description: 'Filtrar por tipo de hardware (ej. RAM, SSD, Procesador)',
    }),
    ApiQuery({
      name: 'is_active',
      required: false,
      type: Boolean,
      description: 'Filtrar por estado activo (true/false)',
    }),
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      example: 1,
      description: 'Número de página',
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      example: 10,
      description: 'Cantidad de registros por página',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Lista de hardware obtenida exitosamente.',
    }),
  );

export const ApiGetHardwareOptionsSwagger = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Obtener opciones reducidas de hardware para selectores',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Opciones de hardware obtenidas exitosamente.',
    }),
  );

export const ApiFindByIdHardwareSwagger = () =>
  applyDecorators(
    ApiOperation({ summary: 'Obtener hardware por ID' }),
    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID numérico del hardware',
    }),
    ApiResponse({ status: HttpStatus.OK, description: 'Hardware encontrado.' }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Hardware no encontrado.',
    }),
  );

export const ApiCreateHardwareSwagger = () =>
  applyDecorators(
    ApiOperation({ summary: 'Registrar un nuevo hardware' }),
    ApiBody({ type: CreateHardwareRequestDto }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Hardware registrado exitosamente.',
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Datos de entrada inválidos.',
    }),
  );

export const ApiUpdateHardwareSwagger = () =>
  applyDecorators(
    ApiOperation({ summary: 'Actualizar un hardware existente' }),
    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID del hardware a actualizar',
    }),
    ApiBody({ type: UpdateHardwareRequestDto }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Hardware actualizado exitosamente.',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Hardware no encontrado.',
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Datos de entrada inválidos.',
    }),
  );

export const ApiToggleHardwareStatusSwagger = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Alternar estado del hardware (Activo/Inactivo)',
    }),
    ApiParam({ name: 'id', type: Number, description: 'ID del hardware' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Estado actualizado correctamente.',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Hardware no encontrado.',
    }),
  );