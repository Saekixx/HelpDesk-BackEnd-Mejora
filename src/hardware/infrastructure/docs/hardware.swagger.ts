import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { CreateHardwareRequestDto } from '../dtos/create-hardware.request.dto';
import { UpdateHardwareRequestDto } from '../dtos/update-hardware.request.dto';

export const ApiHardwareTag = () => ApiTags('Hardware');

export const ApiFindAllHardwareSwagger = () =>
  applyDecorators(
    ApiOperation({ summary: 'Listar todos los equipos de hardware' }),
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