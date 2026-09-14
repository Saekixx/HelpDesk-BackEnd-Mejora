import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiBody } from '@nestjs/swagger';
import { CreateClienteRequestDto } from '../dtos/create-cliente.dto';
import { UpdateClienteRequestDto } from '../dtos/update-cliente.dto';

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

export function ApiFindAllClientesSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Listar clientes',
      description:
        'Retorna un listado paginado de clientes (empresas), con filtro opcional por texto de búsqueda y estado activo/inactivo.',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Clientes obtenidos exitosamente.',
      schema: {
        example: {
          message: 'Clientes obtenidos exitosamente',
          data: {
            data: [CLIENTE_EJEMPLO],
            total: 1,
            page: 1,
            limit: 10,
            totalPages: 1,
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

export function ApiFindClienteByIdSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Obtener un cliente por id' }),
    ApiParam({
      name: 'id',
      description: 'ID numérico del cliente',
      example: 1,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Cliente obtenido exitosamente.',
      schema: {
        example: {
          message: 'Cliente obtenido exitosamente',
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
      description: 'El rol del usuario no tiene permiso de lectura.',
    }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'El cliente no existe.' }),
  );
}

export function ApiCreateClienteSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Crear un cliente',
      description: 'Registra un nuevo cliente (empresa) en el sistema.',
    }),
    ApiBody({ type: CreateClienteRequestDto }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Cliente creado exitosamente.',
      schema: {
        example: {
          message: 'Cliente creado exitosamente',
          data: CLIENTE_EJEMPLO,
        },
      },
    }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Datos de entrada inválidos.' }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Token inválido, expirado o ausente.',
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'El rol del usuario no tiene permiso administrativo.',
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
          data: CLIENTE_EJEMPLO,
        },
      },
    }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Datos de entrada inválidos.' }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Token inválido, expirado o ausente.',
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'El rol del usuario no tiene permiso administrativo.',
    }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'El cliente no existe.' }),
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
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'El cliente no existe.' }),
  );
}