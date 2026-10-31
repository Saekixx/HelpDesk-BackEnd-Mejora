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

// Ubicación de ejemplo (cliente > sucursal > área) del equipo donde está instalado.
const EQUIPO_ACTUAL_EJEMPLO = {
  id_equipo: 12,
  codigo: 'EQ-12',
  nombre_equipo: 'PC-Contabilidad-01',
  cliente: { id: 1, nombre: 'Acme Corp SAC' },
  sucursal: { id: 1, nombre: 'Sucursal Central' },
  area: { id: 1, nombre: 'Sistemas' },
};

// Hardware INSTALADO: is_active = true y con equipo/ubicación asignados.
const HARDWARE_EJEMPLO = {
  id_hardware: 7,
  numero_serie: 'SN-9876543210',
  tipo_componente: 'MEMORIA_RAM',
  tipo_componente_label: 'Memoria RAM',
  marca_modelo: 'Kingston Fury 16GB',
  proveedor: 'TechSupply Peru S.A.C.',
  fecha_compra: '2026-01-15T00:00:00.000Z',
  costo_unitario: 350.5,
  url_factura: 'https://storage.empresa.com/facturas/fac-001.pdf',
  estado: 'INSTALADO',
  estado_label: 'Instalado',
  is_active: true,
  equipo_actual: EQUIPO_ACTUAL_EJEMPLO,
  created_at: '2026-01-20T10:30:00.000Z',
  updated_at: '2026-02-01T09:00:00.000Z',
};

// Un ejemplo por cada estado del hardware (EstadoHardware) para el listado.
const HARDWARE_LISTADO_EJEMPLO = [
  HARDWARE_EJEMPLO,
  {
    id_hardware: 8,
    numero_serie: 'SN-5521800417',
    tipo_componente: 'ALMACENAMIENTO_SSD',
    tipo_componente_label: 'Almacenamiento SSD/NVMe',
    marca_modelo: 'Samsung 980 Pro 1TB',
    proveedor: 'TechSupply Peru S.A.C.',
    fecha_compra: '2026-02-03T00:00:00.000Z',
    costo_unitario: 520,
    url_factura: 'https://storage.empresa.com/facturas/fac-002.pdf',
    estado: 'DISPONIBLE',
    estado_label: 'Disponible',
    is_active: false,
    equipo_actual: null,
    created_at: '2026-02-05T08:15:00.000Z',
    updated_at: '2026-02-05T08:15:00.000Z',
  },
  {
    id_hardware: 9,
    numero_serie: 'SN-7730019284',
    tipo_componente: 'PROCESADOR',
    tipo_componente_label: 'Procesador (CPU)',
    marca_modelo: 'Intel Core i7-12700',
    proveedor: 'Compu Import E.I.R.L.',
    fecha_compra: '2025-11-20T00:00:00.000Z',
    costo_unitario: 1180.9,
    estado: 'EN_MANTENIMIENTO',
    estado_label: 'En Mantenimiento',
    is_active: false,
    equipo_actual: {
      id_equipo: 15,
      codigo: 'EQ-15',
      nombre_equipo: 'PC-Soporte-02',
      cliente: { id: 2, nombre: 'Distribuidora Andina SAC' },
      sucursal: { id: 3, nombre: 'Sucursal Arequipa' },
      area: { id: 4, nombre: 'Soporte Técnico' },
    },
    created_at: '2025-11-22T14:00:00.000Z',
    updated_at: '2026-03-10T16:45:00.000Z',
  },
  {
    id_hardware: 10,
    numero_serie: 'SN-1180042265',
    tipo_componente: 'ALMACENAMIENTO_HDD',
    tipo_componente_label: 'Almacenamiento HDD',
    marca_modelo: 'Seagate Barracuda 2TB',
    proveedor: 'Compu Import E.I.R.L.',
    fecha_compra: '2022-06-10T00:00:00.000Z',
    costo_unitario: 210,
    estado: 'BAJA',
    estado_label: 'Baja / Descarte',
    is_active: false,
    equipo_actual: null,
    created_at: '2022-06-12T09:00:00.000Z',
    updated_at: '2026-01-08T11:20:00.000Z',
  },
];

export const ApiHardwareTag = () => ApiTags('Hardware');

export const ApiFindAllHardwareSwagger = () =>
  applyDecorators(
    ApiExtraModels(PaginatedHardwareResponseDto),
    ApiOperation({
      summary: 'Listar todos los equipos de hardware con filtros y paginación',
      description:
        'Retorna un listado paginado de hardware con su estado oficial (INSTALADO, DISPONIBLE, EN_MANTENIMIENTO, BAJA) y el equipo/ubicación (cliente, sucursal, área) donde está instalado. Soporta los filtros `search`, `id_cliente`, `id_sucursal`, `id_area`, `tipo_componente`, `estado`, `proveedor`, `page` y `limit`. El resultado viene dentro de `data`: `data.data` (registros) y `data.meta` (total, page, limit, totalPages).',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Lista paginada de hardware obtenida exitosamente.',
      schema: {
        type: 'object',
        properties: {
          status: { type: 'number', example: HttpStatus.OK },
          message: {
            type: 'string',
            example: 'Hardware obtenidos exitosamente',
          },
          data: { $ref: getSchemaPath(PaginatedHardwareResponseDto) },
        },
        example: {
          status: HttpStatus.OK,
          message: 'Hardware obtenidos exitosamente',
          data: {
            data: HARDWARE_LISTADO_EJEMPLO,
            meta: {
              total: HARDWARE_LISTADO_EJEMPLO.length,
              page: 1,
              limit: 10,
              totalPages: 1,
            },
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description:
        'Filtros inválidos (por ejemplo, un estado inexistente o una página menor a 1).',
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
        type: 'object',
        properties: {
          status: { type: 'number', example: HttpStatus.OK },
          message: {
            type: 'string',
            example: 'Hardware obtenido exitosamente',
          },
          data: { $ref: getSchemaPath(HardwareResponseDto) },
        },
        example: {
          status: HttpStatus.OK,
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

// Cuerpos de ejemplo del modal "Registrar Nuevo Hardware".
const CREAR_HARDWARE_INSTALAR_EJEMPLO = {
  tipo_componente: 'Memoria RAM',
  numero_serie: 'SN-X900-55102',
  marca_modelo: 'Kingston Fury Beast 32GB DDR5 6000MHz CL36',
  proveedor: 'TechSupply Corp Latam',
  fecha_compra: '2026-10-30',
  costo_unitario: 95.5,
  url_factura: 'https://storage.empresa.com/facturas/fac-001.pdf',
  ubicacion_inicial: 'INSTALAR_EQUIPO',
  id_equipo_destino: 5,
};

const CREAR_HARDWARE_ALMACEN_EJEMPLO = {
  tipo_componente: 'ALMACENAMIENTO_SSD',
  numero_serie: 'SN-5521800417',
  marca_modelo: 'Samsung 980 Pro 1TB',
  proveedor: 'TechSupply Corp Latam',
  fecha_compra: '2026-10-30',
  costo_unitario: 120,
  ubicacion_inicial: 'ALMACEN_CENTRAL',
};

export const ApiCreateHardwareSwagger = () =>
  applyDecorators(
    ApiExtraModels(HardwareResponseDto),
    ApiOperation({
      summary: 'Registrar un nuevo hardware',
      description:
        'Con `ubicacion_inicial = ALMACEN_CENTRAL` el hardware queda DISPONIBLE sin equipo. Con `INSTALAR_EQUIPO` se exige `id_equipo_destino`: el equipo debe existir, el hardware queda INSTALADO y se crea su registro activo en el historial de hardware, todo en una sola transacción. `tipo_componente` acepta la clave del enum (`MEMORIA_RAM`) o la etiqueta del modal (`Memoria RAM`). Devuelve el hardware creado.',
    }),
    ApiBody({
      type: CreateHardwareRequestDto,
      examples: {
        instalarEnEquipo: {
          summary: 'Instalar directamente en un equipo',
          value: CREAR_HARDWARE_INSTALAR_EJEMPLO,
        },
        almacenCentral: {
          summary: 'Enviar al almacén central (queda disponible)',
          value: CREAR_HARDWARE_ALMACEN_EJEMPLO,
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Hardware registrado exitosamente.',
      schema: {
        type: 'object',
        properties: {
          status: { type: 'number', example: HttpStatus.CREATED },
          message: {
            type: 'string',
            example: 'Hardware registrado exitosamente',
          },
          data: { $ref: getSchemaPath(HardwareResponseDto) },
        },
        example: {
          status: HttpStatus.CREATED,
          message: 'Hardware registrado exitosamente',
          data: {
            id_hardware: 11,
            numero_serie: 'SN-X900-55102',
            tipo_componente: 'MEMORIA_RAM',
            tipo_componente_label: 'Memoria RAM',
            marca_modelo: 'Kingston Fury Beast 32GB DDR5 6000MHz CL36',
            proveedor: 'TechSupply Corp Latam',
            fecha_compra: '2026-10-30T00:00:00.000Z',
            costo_unitario: 95.5,
            url_factura: 'https://storage.empresa.com/facturas/fac-001.pdf',
            estado: 'INSTALADO',
            estado_label: 'Instalado',
            is_active: true,
            equipo_actual: {
              id_equipo: 5,
              codigo: 'EQ-5',
              nombre_equipo: 'PC-Contabilidad-01',
              cliente: { id: 1, nombre: 'Acme Corp SAC' },
              sucursal: { id: 1, nombre: 'Sucursal Central' },
              area: { id: 1, nombre: 'Sistemas' },
            },
            created_at: '2026-10-30T15:20:00.000Z',
            updated_at: '2026-10-30T15:20:00.000Z',
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description:
        'Datos inválidos: tipo de componente o ubicación inicial inexistentes, campos obligatorios vacíos, costo negativo o con más de 2 decimales, o `id_equipo_destino` ausente al instalar en un equipo.',
      schema: {
        type: 'object',
        properties: {
          status: { type: 'number', example: HttpStatus.BAD_REQUEST },
          message: { type: 'string' },
          data: { type: 'object', nullable: true, example: null },
        },
        example: {
          status: HttpStatus.BAD_REQUEST,
          message: 'El equipo destino es obligatorio al instalar en un equipo',
          data: null,
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'El equipo destino indicado no existe.',
      schema: {
        type: 'object',
        properties: {
          status: { type: 'number', example: HttpStatus.NOT_FOUND },
          message: { type: 'string' },
          data: { type: 'object', nullable: true, example: null },
        },
        example: {
          status: HttpStatus.NOT_FOUND,
          message: 'El equipo destino con ID 5 no existe',
          data: null,
        },
      },
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
      summary: 'Alternar estado del hardware (Instalado/Disponible)',
      description:
        'Si el hardware está INSTALADO pasa a DISPONIBLE; en cualquier otro estado pasa a INSTALADO. `is_active` siempre es true solo cuando el estado es INSTALADO.',
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
