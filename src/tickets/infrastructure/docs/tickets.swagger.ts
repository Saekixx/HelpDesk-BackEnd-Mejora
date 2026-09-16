import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

export function ApiFindAllTicketsSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener lista de tickets con filtros y paginación',
      description:
        'Retorna los tickets registrados permitiendo filtrar por término de búsqueda, estado, cliente, sucursal, área y soporte.',
    }),
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      example: 1,
      description: 'Número de página para la paginación',
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      example: 10,
      description: 'Cantidad de elementos por página',
    }),
    ApiQuery({
      name: 'search',
      required: false,
      type: String,
      description: 'Buscar por PIN, asunto o detalle del ticket',
    }),
    ApiQuery({
      name: 'estado',
      required: false,
      enum: ['Pendiente', 'Asignado', 'En Progreso', 'Reabierto', 'Cerrado'],
      description: 'Filtrar por estado del ticket',
    }),
    ApiQuery({
      name: 'id_cliente',
      required: false,
      type: Number,
      description: 'Filtrar por ID del cliente',
    }),
    ApiQuery({
      name: 'id_sucursal',
      required: false,
      type: Number,
      description: 'Filtrar por ID de la sucursal',
    }),
    ApiQuery({
      name: 'id_area',
      required: false,
      type: Number,
      description: 'Filtrar por ID del área',
    }),
    ApiQuery({
      name: 'id_soporte',
      required: false,
      type: Number,
      description: 'Filtrar por ID del usuario de soporte asignado',
    }),
    ApiResponse({
      status: 200,
      description: 'Tickets obtenidos exitosamente',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Tickets obtenidos exitosamente',
          },
          data: {
            type: 'object',
            properties: {
              data: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id_tickets: { type: 'number', example: 1 },
                    pin: { type: 'string', example: 'TK-101' },
                    asunto: {
                      type: 'string',
                      example: 'Falla en encendido de PC',
                    },
                    fecha_creacion: {
                      type: 'string',
                      format: 'date-time',
                      example: '2026-09-15T20:39:44.000Z',
                    },
                    estado: { type: 'string', example: 'Pendiente' },
                    usuario: {
                      type: 'object',
                      properties: {
                        id: { type: 'number', example: 6 },
                        nombre: { type: 'string', example: 'Jorge Pérez' },
                      },
                    },
                    equipo: {
                      type: 'object',
                      properties: {
                        id: { type: 'number', example: 1 },
                        tipo_equipo: { type: 'string', example: 'Desktop' },
                      },
                    },
                    cliente: {
                      type: 'object',
                      properties: {
                        id: { type: 'number', example: 1 },
                        nombre: {
                          type: 'string',
                          example: 'Innovación Global Tech',
                        },
                      },
                    },
                    sucursal: {
                      type: 'object',
                      nullable: true,
                      properties: {
                        id: { type: 'number', example: 1 },
                        nombre: { type: 'string', example: 'Sede Central' },
                      },
                    },
                    area: {
                      type: 'object',
                      nullable: true,
                      properties: {
                        id: { type: 'number', example: 1 },
                        nombre: { type: 'string', example: 'Sistemas y TI' },
                      },
                    },
                    soporte: {
                      type: 'object',
                      nullable: true,
                      properties: {
                        id: { type: 'number', example: 2 },
                        nombre: { type: 'string', example: 'Ana López' },
                      },
                    },
                  },
                },
              },
              total: { type: 'number', example: 4 },
              page: { type: 'number', example: 1 },
              limit: { type: 'number', example: 10 },
              totalPages: { type: 'number', example: 1 },
            },
          },
        },
      },
    }),
  );
}
