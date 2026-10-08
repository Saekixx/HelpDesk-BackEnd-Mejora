import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { CreateSoftwareRequestDto } from '../dtos/create-software.request.dto';
import { UpdateSoftwareRequestDto } from '../dtos/update-software.request.dto';

export const ApiSoftwareTag = () => ApiTags('Software');

export const ApiFindAllSoftwareSwagger = () =>
  applyDecorators(
    ApiOperation({
      summary:
        'Obtener un listado paginado de software, con filtro opcional por texto de búsqueda y estado activo/inactivo.',
    }),
    ApiQuery({
      name: 'search',
      required: false,
      type: String,
      description: 'Término de búsqueda (tipo, marca, modelo o nombre del software)',
      example: 'Microsoft Office',
    }),
    ApiQuery({
      name: 'is_active',
      required: false,
      type: Boolean,
      description: 'Filtrar por estado activo/inactivo',
      example: true,
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
      description: 'Lista de software obtenida exitosamente.',
    }),
  );

export const ApiGetSoftwareOptionsSwagger = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Obtener opciones reducidas de software para selectores',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Opciones de software obtenidas exitosamente.',
    }),
  );

export const ApiFindByIdSoftwareSwagger = () =>
  applyDecorators(
    ApiOperation({ summary: 'Obtener software por ID' }),
    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID numérico del software',
    }),
    ApiResponse({ status: HttpStatus.OK, description: 'Software encontrado.' }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Software no encontrado.',
    }),
  );

export const ApiCreateSoftwareSwagger = () =>
  applyDecorators(
    ApiOperation({ summary: 'Registrar un nuevo software' }),
    ApiBody({ type: CreateSoftwareRequestDto }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Software registrado exitosamente.',
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Datos de entrada inválidos.',
    }),
  );

export const ApiUpdateSoftwareSwagger = () =>
  applyDecorators(
    ApiOperation({ summary: 'Actualizar un software existente' }),
    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID del software a actualizar',
    }),
    ApiBody({ type: UpdateSoftwareRequestDto }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Software actualizado exitosamente.',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Software no encontrado.',
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Datos de entrada inválidos.',
    }),
  );

export const ApiToggleSoftwareStatusSwagger = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Alternar estado del software (Activo/Inactivo)',
    }),
    ApiParam({ name: 'id', type: Number, description: 'ID del software' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Estado actualizado correctamente.',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Software no encontrado.',
    }),
  );