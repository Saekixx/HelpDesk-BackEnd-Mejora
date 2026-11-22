import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
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
import { HardwareDetailResponseDto } from '../dtos/hardware-detail-response.dto';
import { HardwareUpdateResponseDto } from '../dtos/hardware-update-response.dto';
import { TransitionHardwareRequestDto } from '../dtos/transition-hardware.request.dto';
import { HardwareTransitionResponseDto } from '../dtos/hardware-transition-response.dto';
import { HardwareStatsResponseDto } from '../dtos/hardware-stats-response.dto';

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

// Opciones de hardware para selectores y autocompletados (sin paginación).
const HARDWARE_OPCIONES_EJEMPLO = [
  {
    id_hardware: 8,
    numero_serie: 'SN-5521800417',
    marca_modelo: 'Samsung 980 Pro 1TB',
    tipo_componente: 'ALMACENAMIENTO_SSD',
    estado: 'DISPONIBLE',
  },
  {
    id_hardware: 11,
    numero_serie: 'SN-1100234988',
    marca_modelo: 'Kingston Fury 16GB',
    tipo_componente: 'MEMORIA_RAM',
    estado: 'DISPONIBLE',
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
      description:
        'Retorna un arreglo plano (sin paginación) con `id_hardware`, `numero_serie`, `marca_modelo`, `tipo_componente` y `estado` (claves del enum), ordenado por marca/modelo. Filtros opcionales: `estado` (ej. DISPONIBLE para elegir hardware a instalar), `tipo_componente` e `id_equipo_actual` (hardware instalado en un equipo). `estado` y `tipo_componente` aceptan la clave o la etiqueta, sin distinguir mayúsculas.',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Opciones de hardware obtenidas exitosamente.',
      schema: {
        type: 'object',
        properties: {
          status: { type: 'number', example: HttpStatus.OK },
          message: {
            type: 'string',
            example: 'Opciones de hardware obtenidas exitosamente',
          },
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id_hardware: { type: 'number', example: 8 },
                numero_serie: { type: 'string', example: 'SN-5521800417' },
                marca_modelo: {
                  type: 'string',
                  example: 'Samsung 980 Pro 1TB',
                },
                tipo_componente: {
                  type: 'string',
                  example: 'ALMACENAMIENTO_SSD',
                },
                estado: { type: 'string', example: 'DISPONIBLE' },
              },
            },
          },
        },
        example: {
          status: HttpStatus.OK,
          message: 'Opciones de hardware obtenidas exitosamente',
          data: HARDWARE_OPCIONES_EJEMPLO,
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description:
        'Filtros inválidos (estado o tipo de componente inexistente, o id_equipo_actual no numérico o menor a 1).',
    }),
  );

// Resumen de ejemplo: totalComponentes = asignadosEquipos + enStock + enBaja + enMantenimiento.
const HARDWARE_ESTADISTICAS_EJEMPLO = {
  totalComponentes: 120,
  asignadosEquipos: 80,
  enStock: 25,
  enBaja: 5,
  enMantenimiento: 10,
};

export const ApiGetHardwareStatsSwagger = () =>
  applyDecorators(
    ApiExtraModels(HardwareStatsResponseDto),
    ApiOperation({
      summary: 'Obtener estadísticas de hardware por estado',
      description:
        'Retorna un objeto plano con la cantidad de componentes por estado: `asignadosEquipos` (INSTALADO), `enStock` (DISPONIBLE), `enMantenimiento` (EN_MANTENIMIENTO) y `enBaja` (BAJA). `totalComponentes` es la suma de los cuatro, por lo que siempre coincide con el desglose. Resume todo el inventario y no acepta filtros. Se calcula con una sola consulta agrupada en base de datos, sin cargar los registros en memoria.',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Estadísticas de hardware obtenidas exitosamente.',
      schema: {
        type: 'object',
        properties: {
          status: { type: 'number', example: HttpStatus.OK },
          message: {
            type: 'string',
            example: 'Estadísticas de hardware obtenidas exitosamente',
          },
          data: { $ref: getSchemaPath(HardwareStatsResponseDto) },
        },
        example: {
          status: HttpStatus.OK,
          message: 'Estadísticas de hardware obtenidas exitosamente',
          data: HARDWARE_ESTADISTICAS_EJEMPLO,
        },
      },
    }),
  );

// Hoja de vida de un componente INSTALADO: ubicación actual y dos movimientos
// (la instalación vigente y un retiro anterior), del más reciente al más antiguo.
const HARDWARE_DETALLE_EJEMPLO = {
  id_hardware: 7,
  numero_serie: 'SN-9876543210',
  marca_modelo: 'Kingston Fury 16GB',
  proveedor: 'TechSupply Peru S.A.C.',
  fecha_compra: '2026-01-15T00:00:00.000Z',
  costo_unitario: 350.5,
  url_factura: 'https://storage.empresa.com/facturas/fac-001.pdf',
  tipo_componente: 'MEMORIA_RAM',
  tipo_componente_label: 'Memoria RAM',
  estado: 'INSTALADO',
  estado_label: 'Instalado',
  equipo_actual: {
    id_equipo: 12,
    codigo: 'EQ-12',
    nombre_equipo: 'PC-Contabilidad-01',
    cliente: { id_cliente: 1, nombre_principal: 'Acme Corp SAC' },
    sucursal: { id_sucursal: 1, nombre_sucursal: 'Sucursal Central' },
    area: { id_area: 1, nombre_area: 'Sistemas' },
  },
  historial: [
    {
      id_RH: 31,
      fecha_instalacion: '2026-02-10T14:20:00.000Z',
      fecha_retiro: null,
      motivo_retiro: null,
      is_actual: true,
      equipo: { id_equipo: 12, nombre_equipo: 'PC-Contabilidad-01' },
      tecnico_responsable: {
        id_usuario: 4,
        nombre: 'Carlos',
        apellido: 'Ramírez',
      },
    },
    {
      id_RH: 18,
      fecha_instalacion: '2026-01-20T10:30:00.000Z',
      fecha_retiro: '2026-02-10T14:15:00.000Z',
      motivo_retiro: 'Reubicado a otro equipo por reasignación de recursos',
      is_actual: false,
      equipo: { id_equipo: 9, nombre_equipo: 'PC-Recepcion-02' },
      tecnico_responsable: null,
    },
  ],
  created_at: '2026-01-20T10:30:00.000Z',
  updated_at: '2026-02-10T14:20:00.000Z',
};

export const ApiFindByIdHardwareSwagger = () =>
  applyDecorators(
    ApiExtraModels(HardwareDetailResponseDto),
    ApiOperation({
      summary: 'Obtener la hoja de vida de un componente de hardware',
      description:
        'Retorna el detalle del componente: datos de compra y factura, estado oficial, equipo donde está instalado con su ubicación (cliente, sucursal y área; `equipo_actual` es `null` si no está asignado) y el historial de movimientos (instalaciones y retiros) con el equipo y el técnico responsable, del más reciente al más antiguo.',
    }),
    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID numérico del hardware',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Hoja de vida del componente obtenida exitosamente.',
      schema: {
        type: 'object',
        properties: {
          status: { type: 'number', example: HttpStatus.OK },
          message: {
            type: 'string',
            example: 'Hardware obtenido exitosamente',
          },
          data: { $ref: getSchemaPath(HardwareDetailResponseDto) },
        },
        example: {
          status: HttpStatus.OK,
          message: 'Hardware obtenido exitosamente',
          data: HARDWARE_DETALLE_EJEMPLO,
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'El ID indicado no es un número válido.',
      schema: {
        type: 'object',
        properties: {
          status: { type: 'number', example: HttpStatus.BAD_REQUEST },
          message: { type: 'string' },
          data: { type: 'object', nullable: true, example: null },
        },
        example: {
          status: HttpStatus.BAD_REQUEST,
          message: 'Validation failed (numeric string is expected)',
          data: null,
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Hardware no encontrado.',
      schema: {
        type: 'object',
        properties: {
          status: { type: 'number', example: HttpStatus.NOT_FOUND },
          message: { type: 'string' },
          data: { type: 'object', nullable: true, example: null },
        },
        example: {
          status: HttpStatus.NOT_FOUND,
          message: 'El hardware con ID 999 no existe',
          data: null,
        },
      },
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

// Cuerpos de ejemplo de PATCH /hardware/:id (todos los campos son opcionales).
const ACTUALIZAR_HARDWARE_PARCIAL_EJEMPLO = {
  marca_modelo: 'Kingston Fury Beast 32GB DDR5 6000MHz CL36',
  costo_unitario: 350.5,
};

const ACTUALIZAR_HARDWARE_COMPLETO_EJEMPLO = {
  tipo_componente: 'Memoria RAM',
  numero_serie: 'SN-9876543210',
  marca_modelo: 'Kingston Fury Beast 32GB DDR5 6000MHz CL36',
  proveedor: 'TechSupply Peru S.A.C.',
  fecha_compra: '2026-01-15',
  costo_unitario: 350.5,
  url_factura: 'facturas/fac-001.pdf',
};

// Hardware tras actualizar su ficha técnica: el estado no cambia con el PATCH.
const HARDWARE_ACTUALIZADO_EJEMPLO = {
  id_hardware: 7,
  numero_serie: 'SN-9876543210',
  marca_modelo: 'Kingston Fury Beast 32GB DDR5 6000MHz CL36',
  proveedor: 'TechSupply Peru S.A.C.',
  fecha_compra: '2026-01-15T00:00:00.000Z',
  costo_unitario: 350.5,
  url_factura: 'facturas/fac-001.pdf',
  tipo_componente: 'MEMORIA_RAM',
  tipo_componente_label: 'Memoria RAM',
  estado: 'INSTALADO',
  estado_label: 'Instalado',
  updated_at: '2026-10-30T15:45:00.000Z',
};

export const ApiUpdateHardwareSwagger = () =>
  applyDecorators(
    ApiExtraModels(HardwareUpdateResponseDto),
    ApiOperation({
      summary: 'Actualizar la ficha técnica de un hardware',
      description:
        'Actualización parcial: solo se modifican los campos enviados (`tipo_componente`, `numero_serie`, `marca_modelo`, `proveedor`, `fecha_compra`, `costo_unitario`, `url_factura`); los omitidos conservan su valor. `tipo_componente` acepta la clave del enum (`MEMORIA_RAM`) o la etiqueta (`Memoria RAM`). El estado y el equipo asignado no se editan aquí: enviar cualquier otra propiedad devuelve 400. Un body vacío no modifica nada. Devuelve el hardware actualizado.',
    }),
    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID del hardware a actualizar',
    }),
    ApiBody({
      type: UpdateHardwareRequestDto,
      examples: {
        actualizacionParcial: {
          summary: 'Actualización parcial (solo algunos campos)',
          value: ACTUALIZAR_HARDWARE_PARCIAL_EJEMPLO,
        },
        todosLosCampos: {
          summary: 'Todos los campos editables',
          value: ACTUALIZAR_HARDWARE_COMPLETO_EJEMPLO,
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Hardware actualizado exitosamente.',
      schema: {
        type: 'object',
        properties: {
          status: { type: 'number', example: HttpStatus.OK },
          message: {
            type: 'string',
            example: 'Hardware actualizado exitosamente',
          },
          data: { $ref: getSchemaPath(HardwareUpdateResponseDto) },
        },
        example: {
          status: HttpStatus.OK,
          message: 'Hardware actualizado exitosamente',
          data: HARDWARE_ACTUALIZADO_EJEMPLO,
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description:
        'Datos inválidos: ID no numérico, tipo de componente inexistente, campos de texto vacíos o que superan su longitud máxima, fecha no ISO 8601, costo negativo o con más de 2 decimales, o propiedades no permitidas (como `estado`).',
      schema: {
        type: 'object',
        properties: {
          status: { type: 'number', example: HttpStatus.BAD_REQUEST },
          message: { type: 'string' },
          data: { type: 'object', nullable: true, example: null },
        },
        example: {
          status: HttpStatus.BAD_REQUEST,
          message: 'El costo unitario no puede ser negativo',
          data: null,
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Hardware no encontrado.',
      schema: {
        type: 'object',
        properties: {
          status: { type: 'number', example: HttpStatus.NOT_FOUND },
          message: { type: 'string' },
          data: { type: 'object', nullable: true, example: null },
        },
        example: {
          status: HttpStatus.NOT_FOUND,
          message: 'El hardware con ID 999 no existe',
          data: null,
        },
      },
    }),
  );

// Bodies de ejemplo de PATCH /hardware/:id/transition (uno por estado destino).
const TRANSICION_INSTALAR_EJEMPLO = {
  estado: 'INSTALADO',
  id_equipo: 12,
  motivo: 'Instalación en PC-Contabilidad-01 por ampliación de memoria',
};
const TRANSICION_DISPONIBLE_EJEMPLO = {
  estado: 'DISPONIBLE',
  motivo: 'Retirado del equipo tras la migración a un nuevo modelo',
};
const TRANSICION_MANTENIMIENTO_EJEMPLO = {
  estado: 'EN_MANTENIMIENTO',
  motivo: 'Falla detectada en pruebas de memoria; se envía a revisión',
};
const TRANSICION_BAJA_EJEMPLO = {
  estado: 'BAJA',
  motivo: 'Componente irreparable; se descarta del inventario',
};

// Hardware tras instalarse: `equipo_actual` con su ubicación.
const TRANSICION_RESPUESTA_EJEMPLO = {
  id_hardware: 7,
  numero_serie: 'SN-9876543210',
  marca_modelo: 'Kingston Fury 16GB',
  estado: 'INSTALADO',
  estado_label: 'Instalado',
  equipo_actual: EQUIPO_ACTUAL_EJEMPLO,
  updated_at: '2026-10-30T15:45:00.000Z',
};

export const ApiTransitionHardwareSwagger = () =>
  applyDecorators(
    ApiBearerAuth('access-token'),
    ApiExtraModels(HardwareTransitionResponseDto),
    ApiOperation({
      summary: 'Cambiar el estado de un hardware (con trazabilidad)',
      description:
        'Cambia el estado del hardware y deja registro en su hoja de vida (`registro_hardware`) con el motivo y el técnico autenticado como responsable. `estado` acepta la clave (`EN_MANTENIMIENTO`) o la etiqueta (`En Mantenimiento`). Con `INSTALADO` el `id_equipo` es obligatorio y el componente queda asignado a ese equipo; con `DISPONIBLE`, `EN_MANTENIMIENTO` o `BAJA` se cierra la instalación vigente y `equipo_actual` pasa a null. `BAJA` es definitivo. Roles: ADMINISTRADOR, SOPORTE_INSITU y SOPORTE_TECNICO.',
    }),
    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID del hardware cuyo estado se cambia',
    }),
    ApiBody({
      type: TransitionHardwareRequestDto,
      examples: {
        instalar: {
          summary: 'Instalar en un equipo (requiere id_equipo)',
          value: TRANSICION_INSTALAR_EJEMPLO,
        },
        disponible: {
          summary: 'Retirar y dejar disponible',
          value: TRANSICION_DISPONIBLE_EJEMPLO,
        },
        mantenimiento: {
          summary: 'Enviar a mantenimiento',
          value: TRANSICION_MANTENIMIENTO_EJEMPLO,
        },
        baja: {
          summary: 'Dar de baja / descarte (definitivo)',
          value: TRANSICION_BAJA_EJEMPLO,
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Estado del hardware actualizado exitosamente.',
      schema: {
        type: 'object',
        properties: {
          status: { type: 'number', example: HttpStatus.OK },
          message: {
            type: 'string',
            example: 'Estado del hardware actualizado exitosamente',
          },
          data: { $ref: getSchemaPath(HardwareTransitionResponseDto) },
        },
        example: {
          status: HttpStatus.OK,
          message: 'Estado del hardware actualizado exitosamente',
          data: TRANSICION_RESPUESTA_EJEMPLO,
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description:
        'Datos inválidos: ID no numérico, estado inexistente, motivo vacío o de más de 500 caracteres, o falta id_equipo al instalar.',
      schema: {
        type: 'object',
        properties: {
          status: { type: 'number', example: HttpStatus.BAD_REQUEST },
          message: { type: 'string' },
          data: { type: 'object', nullable: true, example: null },
        },
        example: {
          status: HttpStatus.BAD_REQUEST,
          message: 'El equipo es obligatorio al instalar el hardware',
          data: null,
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Token inválido, expirado o ausente.',
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description:
        'El rol del usuario no puede cambiar el estado del hardware.',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Hardware o equipo destino no encontrado.',
      schema: {
        type: 'object',
        properties: {
          status: { type: 'number', example: HttpStatus.NOT_FOUND },
          message: { type: 'string' },
          data: { type: 'object', nullable: true, example: null },
        },
        example: {
          status: HttpStatus.NOT_FOUND,
          message: 'El hardware con ID 999 no existe',
          data: null,
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description:
        'Transición no permitida desde el estado actual, el hardware ya está en ese estado (y equipo), o fue modificado por otra operación mientras se aplicaba.',
      schema: {
        type: 'object',
        properties: {
          status: { type: 'number', example: HttpStatus.CONFLICT },
          message: { type: 'string' },
          data: { type: 'object', nullable: true, example: null },
        },
        example: {
          status: HttpStatus.CONFLICT,
          message:
            "No se puede cambiar un hardware de 'Disponible' a 'En Mantenimiento'",
          data: null,
        },
      },
    }),
  );
