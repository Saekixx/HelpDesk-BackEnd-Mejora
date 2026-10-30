import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiExtraModels,
  getSchemaPath,
} from '@nestjs/swagger';
import { CreateHardwareRequestDto } from '../dtos/create-hardware.request.dto';
import { UpdateHardwareRequestDto } from '../dtos/update-hardware.request.dto';
import {
  HardwareResponseDto,
  PaginatedHardwareResponseDto,
} from '../dtos/hardware-response.dto';

const HARDWARE_EJEMPLO = {
  id_hardware: 7,
  numero_serie: 'SN-9876543210',
  tipo_equipo: 'Memoria RAM',
  marca: 'Kingston Fury 16GB',
  proveedor: 'TechSupply Peru S.A.C.',
  fecha_compra: '2026-01-15T00:00:00.000Z',
  url_factura: 'https://storage.empresa.com/facturas/fac-001.pdf',
  estado: 'INSTALADO',
  estado_label: 'Instalado',
  is_active: true,
  equipo_actual: {
    id_equipo: 12,
    codigo: 'EQ-12',
    nombre_equipo: 'PC-Contabilidad-01',
    cliente: { id: 1, nombre: 'Acme Corp SAC' },
    sucursal: { id: 1, nombre: 'Sucursal Central' },
    area: { id: 1, nombre: 'Sistemas' },
  },
  created_at: '2026-01-20T10:30:00.000Z',
  updated_at: '2026-02-01T09:00:00.000Z',
};

export const ApiHardwareTag = () => ApiTags('Hardware');

export const ApiFindAllHardwareSwagger = () =>
  applyDecorators(
    ApiExtraModels(PaginatedHardwareResponseDto),
    ApiOperation({
      summary: 'Listar todos los equipos de hardware con filtros y paginación',
      description:
        'Retorna un listado paginado de hardware con su estado oficial y el equipo/ubicación (cliente, sucursal, área) donde está instalado. La respuesta incluye `data` y `meta` (total, page, limit, totalPages).',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Lista de hardware obtenida exitosamente.',
      schema: {
        allOf: [
          {
            properties: {
              message: { type: 'string' },
              data: { $ref: getSchemaPath(PaginatedHardwareResponseDto) },
            },
          },
        ],
        example: {
          message: 'Hardware obtenidos exitosamente',
          data: {
            data: [HARDWARE_EJEMPLO],
            meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
          },
        },
      },
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
    ApiExtraModels(HardwareResponseDto),
    ApiOperation({ summary: 'Obtener hardware por ID' }),
    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID numérico del hardware',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Hardware encontrado.',
      schema: {
        allOf: [
          {
            properties: {
              message: { type: 'string' },
              data: { $ref: getSchemaPath(HardwareResponseDto) },
            },
          },
        ],
        example: {
          message: 'Hardware obtenido exitosamente',
          data: HARDWARE_EJEMPLO,
        },
      },
    }),
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
