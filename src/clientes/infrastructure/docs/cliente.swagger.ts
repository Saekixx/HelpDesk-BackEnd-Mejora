import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiBody,
  ApiExtraModels,
  getSchemaPath,
} from '@nestjs/swagger';
import { CreateClienteRequestDto } from '../dtos/create-cliente.dto';
import { CreateClienteResponseDto } from '../dtos/create-cliente-response.dto';
import { UpdateClienteRequestDto } from '../dtos/update-cliente.dto';
import { ClienteDetailResponseDto } from '../dtos/cliente-detail-response.dto';
import { PaginatedClientesResponseDto } from '../dtos/cliente-list-response.dto';

const CLIENTE_EJEMPLO = {
  id_cliente: 1,
  tipo_cliente: 'JURIDICA',
  numero_documento: '20123456789',
  nombre_principal: 'Acme Corp SAC',
  direccion: 'Av. Siempre Viva 123',
  telefono: '+51987654321',
  correo: 'contacto@acme.com',
  rubro: 'Retail',
  fecha_inicio_plan: '2026-01-01',
  fecha_finalizacion_plan: '2026-12-31',
  costo_negociado: 1500.5,
  limite_equipos_contratado: 20,
  id_plan: 1,
  is_active: true,
};

// Body de ejemplo de POST /clientes (modal de registro de empresa en 3 pasos)
const CREATE_CLIENTE_REQUEST_EJEMPLO = {
  datos_empresa: {
    tipo_cliente: 'JURIDICA',
    numero_documento: '20123456789',
    nombre_principal: 'Acme Corp SAC',
    direccion: 'Av. Siempre Viva 123',
    rubro: 'Retail',
    id_plan: 1,
  },
  responsable: {
    nombre: 'Carlos',
    apellido: 'Mendoza',
    cargo: 'Gerente de TI',
    telefono: '987654321',
    correo: 'carlos.mendoza@acme.com',
  },
  sucursal_principal: {
    nombre_sucursal: 'Sede Central',
    encargado: 'Juan Pérez',
    direccion: 'Jr. Los Pinos 456',
    is_principal: true,
  },
};

// Contenido de `data` en la respuesta 201 de POST /clientes
const CREATE_CLIENTE_RESPONSE_EJEMPLO = {
  id_cliente: 1,
  nombre_principal: 'Acme Corp SAC',
  ruc: '20123456789',
  sucursal_principal_id: 1,
  usuario_responsable_id: 12,
};

const CLIENTE_LIST_ITEM_EJEMPLO = {
  id_cliente: 1,
  nombre_principal: 'Banco Andino S.A.',
  rubro: 'Sector Financiero & Banca',
  tipo_cliente: 'JURIDICA',
  numero_documento: '20123456789',
  totalSucursales: 3,
  planSoporte: 'Plan Premium',
  estado: 'activo',
};

const CLIENTE_DETAIL_EJEMPLO = {
  id_cliente: 1,
  nombre_principal: 'Acme Corp SAC',
  numero_documento: '20123456789',
  tipo_cliente: 'JURIDICA',
  rubro: 'Retail',
  direccion: 'Av. Siempre Viva 123',
  plan: {
    id_plan: 1,
    tipo: 'Tech Enterprise',
    limite_equipos: 30,
  },
  contacto_enlace: {
    nombre_responsable: 'Carlos Mendoza',
    cargo: 'Representante de la empresa',
    correo: 'carlos.mendoza@acme.com',
    telefono: '987654321',
  },
  sucursales_activas: [
    {
      id_sucursal: 1,
      is_principal: true,
      nombre: 'Sede Central',
      direccion: 'Jr. Los Pinos 456',
      total_equipos: 12,
    },
    {
      id_sucursal: 2,
      is_principal: false,
      nombre: 'Sucursal Norte',
      direccion: 'Av. Los Álamos 789',
      total_equipos: 5,
    },
  ],
};

export function ApiFindAllClientesSwagger() {
  return applyDecorators(
    ApiExtraModels(PaginatedClientesResponseDto),
    ApiOperation({
      summary: 'Listar clientes (Listado Avanzado)',
      description:
        'Retorna un listado paginado de clientes con id, nombre/razón social, rubro, tipo, documento, total de sucursales, plan de soporte y estado. Admite búsqueda parcial (nombre/razón social, documento o correo), filtro por tipo de cliente, estado (`estado`=activo|inactivo) y paginación (`page`, `limit` máx. 100). La respuesta incluye `data` y `meta` (total, page, limit, totalPages).',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Clientes obtenidos exitosamente.',
      schema: {
        allOf: [
          {
            properties: {
              message: { type: 'string' },
              data: { $ref: getSchemaPath(PaginatedClientesResponseDto) },
            },
          },
        ],
        example: {
          message: 'Clientes obtenidos exitosamente',
          data: {
            data: [CLIENTE_LIST_ITEM_EJEMPLO],
            meta: {
              total: 1,
              page: 1,
              limit: 10,
              totalPages: 1,
            },
          },
        },
      },
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

export function ApiGetClientesOptionsSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Listar clientes en formato opción',
      description:
        'Retorna un listado reducido (id, nombre) de todos los clientes activos, pensado para poblar selects en el frontend.',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Opciones de cliente obtenidas exitosamente.',
      schema: {
        example: {
          data: [{ id: 1, nombre: 'Acme Corp SAC' }],
        },
      },
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

export function ApiGetClienteStatsSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener estadísticas de clientes (KPIs)',
      description:
        'Retorna los indicadores de las tarjetas superiores de la vista de gestión de clientes: total de clientes (con los registrados en el mes actual), cantidad de clientes jurídicos y naturales, y cantidad de clientes activos con plan Enterprise.',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Estadísticas de clientes obtenidas exitosamente.',
      schema: {
        example: {
          message: 'Estadísticas de clientes obtenidas exitosamente',
          data: {
            totalClientes: { cantidad: 18, nuevosEsteMes: 2 },
            clientesJuridicos: { cantidad: 14 },
            clientesNaturales: { cantidad: 4 },
            planesEnterprise: { cantidad: 12 },
          },
        },
      },
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

export function ApiFindClienteByIdSwagger() {
  return applyDecorators(
    ApiExtraModels(ClienteDetailResponseDto),
    ApiOperation({
      summary: 'Obtener el detalle de un cliente por id',
      description:
        'Retorna el detalle del cliente que consume el modal "Detalle de Cliente / Empresa": datos generales, plan contratado, contacto de enlace y sus sucursales activas con el total de equipos de cada una. La sucursal principal (`is_principal: true`) siempre aparece primero. `plan` y `contacto_enlace` son `null` cuando no existen.',
    }),
    ApiParam({
      name: 'id',
      type: Number,
      description: 'ID numérico del cliente',
      example: 1,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Cliente obtenido exitosamente.',
      schema: {
        allOf: [
          {
            properties: {
              message: {
                type: 'string',
                example: 'Cliente obtenido exitosamente',
              },
              data: { $ref: getSchemaPath(ClienteDetailResponseDto) },
            },
          },
        ],
        example: {
          message: 'Cliente obtenido exitosamente',
          data: CLIENTE_DETAIL_EJEMPLO,
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'El id de la ruta no es un número válido.',
      schema: {
        example: {
          status: 400,
          message: 'Validation failed (numeric string is expected)',
          data: null,
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Token inválido, expirado o ausente.',
      schema: {
        example: {
          status: 401,
          message: 'Token inválido o expirado',
          data: null,
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description:
        'El rol del usuario no tiene permiso de lectura (se requiere ADMINISTRADOR, SOPORTE_TECNICO o SOPORTE_INSITU).',
      schema: {
        example: {
          status: 403,
          message: 'Forbidden resource',
          data: null,
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'El cliente no existe.',
      schema: {
        example: {
          status: 404,
          message: 'Cliente no encontrado',
          data: null,
        },
      },
    }),
  );
}

export function ApiCreateClienteSwagger() {
  return applyDecorators(
    ApiExtraModels(CreateClienteResponseDto),
    ApiOperation({
      summary: 'Registrar una empresa cliente y su cuenta principal',
      description:
        'Registra una empresa cliente en un solo paso atómico (transacción): crea el cliente (`datos_empresa`), el usuario responsable con rol `CLIENTE_EMPRESA` que usará el correo del responsable como usuario de acceso (`responsable`) y la sucursal matriz (`sucursal_principal`, siempre con `is_principal: true`). Si cualquiera de los pasos falla no se guarda nada. El número de documento y el correo del responsable deben ser únicos, y el `id_plan` debe existir. Solo puede ejecutarlo un usuario con rol `ADMINISTRADOR`.',
    }),
    ApiBody({
      type: CreateClienteRequestDto,
      description:
        'Payload anidado en 3 bloques: datos de la empresa, responsable y sucursal principal.',
      examples: {
        completo: {
          summary: 'Empresa jurídica con todos los campos',
          value: CREATE_CLIENTE_REQUEST_EJEMPLO,
        },
        minimo: {
          summary: 'Solo campos obligatorios',
          value: {
            datos_empresa: {
              tipo_cliente: 'NATURAL',
              numero_documento: '45871236',
              nombre_principal: 'María Torres Quispe',
              id_plan: 1,
            },
            responsable: {
              nombre: 'María',
              apellido: 'Torres',
              telefono: '912345678',
              correo: 'maria.torres@correo.com',
            },
            sucursal_principal: {
              nombre_sucursal: 'Oficina Principal',
            },
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Empresa y cuenta principal registradas correctamente',
      type: CreateClienteResponseDto,
      schema: {
        allOf: [
          {
            properties: {
              status: { type: 'number', example: 201 },
              message: {
                type: 'string',
                example: 'Empresa y cuenta principal registradas correctamente',
              },
              data: { $ref: getSchemaPath(CreateClienteResponseDto) },
            },
          },
        ],
        example: {
          status: 201,
          message: 'Empresa y cuenta principal registradas correctamente',
          data: CREATE_CLIENTE_RESPONSE_EJEMPLO,
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description:
        'Error de validación del payload (campos obligatorios, formato de correo, tipos, propiedades no permitidas) o el plan indicado (`id_plan`) no existe.',
      content: {
        'application/json': {
          examples: {
            validacion: {
              summary: 'Error de validación',
              value: {
                status: 400,
                message:
                  'datos_empresa.El número de documento es obligatorio, responsable.El correo electrónico debe ser válido',
                data: null,
              },
            },
            planNoExiste: {
              summary: 'El plan no existe',
              value: {
                status: 400,
                message: 'El plan seleccionado no existe',
                data: null,
              },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Token inválido, expirado o ausente.',
      schema: {
        example: {
          status: 401,
          message: 'Token inválido o expirado',
          data: null,
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description:
        'El rol del usuario no tiene permiso para registrar clientes (se requiere ADMINISTRADOR).',
      schema: {
        example: {
          status: 403,
          message: 'Forbidden resource',
          data: null,
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description:
        'Conflicto: ya existe un cliente con el mismo número de documento o un usuario con el mismo correo del responsable.',
      content: {
        'application/json': {
          examples: {
            documentoDuplicado: {
              summary: 'Número de documento duplicado',
              value: {
                status: 409,
                message:
                  'Ya existe un cliente registrado con ese número de documento',
                data: null,
              },
            },
            correoDuplicado: {
              summary: 'Correo del responsable duplicado',
              value: {
                status: 409,
                message: 'Ya existe un usuario registrado con ese correo',
                data: null,
              },
            },
          },
        },
      },
    }),
  );
}

export function ApiUpdateClienteSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Actualizar un cliente existente' }),
    ApiParam({
      name: 'id',
      description: 'ID numérico del cliente a actualizar',
      example: 1,
    }),
    ApiBody({ type: UpdateClienteRequestDto }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Cliente actualizado exitosamente.',
      schema: {
        example: {
          message: 'Cliente actualizado exitosamente',
          data: CLIENTE_DETAIL_EJEMPLO,
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Datos de entrada inválidos.',
    }),
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
      description: 'El cliente no existe.',
    }),
  );
}

export function ApiToggleClienteStatusSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Activar/desactivar un cliente',
      description: 'Alterna el estado is_active del cliente (soft toggle).',
    }),
    ApiParam({
      name: 'id',
      description: 'ID numérico del cliente a activar/desactivar',
      example: 1,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Estado del cliente actualizado exitosamente.',
      schema: {
        example: {
          message: 'Estado del cliente actualizado exitosamente',
          data: CLIENTE_EJEMPLO,
        },
      },
    }),
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
      description: 'El cliente no existe.',
    }),
  );
}
