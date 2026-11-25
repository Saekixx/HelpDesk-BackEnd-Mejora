import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { CreateCitaDto } from '../dto/create-cita.dto';

export function ApiGetCitasSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener lista de citas de soporte con filtros y paginación',
      description:
        'Retorna las citas de soporte registradas permitiendo filtrar por búsqueda (técnico, cliente o ID de cita), cliente, sucursal, estado o fecha programada.',
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
      description: 'Cantidad de registros por página',
    }),
    ApiQuery({
      name: 'search',
      required: false,
      type: String,
      description:
        'Buscar por nombre/apellido del técnico, cliente o ID de cita',
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
      name: 'estado',
      required: false,
      enum: [
        'Pendiente',
        'En_Camino',
        'Completada',
        'Cancelada',
        'Reprogramada',
      ],
      description: 'Filtrar por estado de la cita',
    }),
    ApiQuery({
      name: 'fecha_programada',
      required: false,
      type: String,
      format: 'date',
      description: 'Filtrar por fecha programada (YYYY-MM-DD)',
    }),
    ApiResponse({
      status: 200,
      description: 'Citas de soporte obtenidas correctamente.',
    }),
    ApiResponse({
      status: 400,
      description: 'Parámetros de consulta inválidos.',
    }),
    ApiResponse({
      status: 401,
      description: 'Token JWT no válido o no enviado.',
    }),
  );
}

export function ApiGetCitaDetalleSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener detalle completo de una cita de soporte por ID',
      description:
        'Retorna toda la información detallada de una cita específica incluyendo técnico, cliente, sucursal (con coordenadas), área, trabajador y equipo.',
    }),
    ApiParam({
      name: 'id',
      description: 'ID único de la cita de soporte',
      type: Number,
      example: 1,
    }),
    ApiResponse({
      status: 200,
      description: 'Cita de soporte obtenida exitosamente.',
    }),
    ApiResponse({
      status: 404,
      description: 'Cita de soporte no encontrada.',
    }),
    ApiResponse({
      status: 401,
      description: 'Token JWT no válido o no enviado.',
    }),
  );
}

export function ApiCreateCitaAndDerivateTicketSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Crear cita de soporte y derivar ticket a InSitu',
      description:
        'Valida el token de bloqueo temporal (SoftLock), crea la cita de soporte, deriva el ticket a InSitu y registra la auditoría.',
    }),
    ApiBody({ type: CreateCitaDto }),
    ApiResponse({
      status: 201,
      description: 'Cita creada y ticket derivado exitosamente.',
    }),
    ApiResponse({
      status: 400,
      description: 'Token de bloqueo no válido o expirado.',
    }),
    ApiResponse({
      status: 404,
      description: 'Ticket no encontrado.',
    }),
  );
}
