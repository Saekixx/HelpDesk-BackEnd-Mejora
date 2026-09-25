import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { AssignSupportCommand } from '../dtos/assign-support.request';
import { CreateTicketDto } from '../dtos/create-ticket.dto';

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
    }),
  );
}

export function ApiCreateTicketSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Crear un nuevo ticket de soporte',
      description:
        'Registra un ticket de soporte técnico inicializando su estado en Pendiente.',
    }),
    ApiBody({ type: CreateTicketDto }),
    ApiResponse({ status: 201, description: 'Ticket creado exitosamente.' }),
    ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' }),
  );
}

export function ApiAssignSupportSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Asignar personal de soporte a un ticket',
      description:
        'Asigna un usuario de soporte al ticket y transiciona su estado a Asignado.',
    }),
    ApiBody({ type: AssignSupportCommand }),
    ApiResponse({ status: 200, description: 'Soporte asignado exitosamente.' }),
    ApiResponse({ status: 404, description: 'Ticket no encontrado.' }),
    ApiResponse({
      status: 400,
      description: 'El ticket no permite la asignación en su estado actual.',
    }),
  );
}

export function ApiStartChatSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Iniciar la atención/chat de un ticket',
      description:
        'Cambia el estado del ticket a "En Progreso" indicando que el soporte técnico ha iniciado la atención.',
    }),
    ApiParam({
      name: 'id',
      description: 'ID del ticket',
      type: Number,
      example: 104,
    }),
    ApiResponse({
      status: 200,
      description: 'Ticket iniciado en progreso correctamente.',
    }),
    ApiResponse({ status: 404, description: 'Ticket no encontrado.' }),
    ApiResponse({
      status: 400,
      description:
        'El ticket debe estar Asignado o Reabierto para iniciar el chat.',
    }),
  );
}

export function ApiReopenTicketSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Reabrir un ticket cerrado',
      description:
        'Permite al cliente creador o a un administrador reabrir un ticket previamente Cerrado.',
    }),
    ApiParam({
      name: 'id',
      description: 'ID del ticket a reabrir',
      type: Number,
      example: 104,
    }),
    ApiResponse({ status: 200, description: 'Ticket reabierto exitosamente.' }),
    ApiResponse({
      status: 403,
      description:
        'Solo el creador del ticket o un Administrador pueden reabrirlo.',
    }),
    ApiResponse({ status: 404, description: 'Ticket no encontrado.' }),
  );
}

export function ApiCloseTicketSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Cerrar un ticket',
      description:
        'Finaliza la atención del ticket. Requiere validación de propiedad según el rol del usuario.',
    }),
    ApiParam({
      name: 'id',
      description: 'ID del ticket a cerrar',
      type: Number,
      example: 104,
    }),
    ApiResponse({ status: 200, description: 'Ticket cerrado exitosamente.' }),
    ApiResponse({
      status: 403,
      description: 'No tienes permisos para cerrar este ticket.',
    }),
    ApiResponse({ status: 404, description: 'Ticket no encontrado.' }),
  );
}
