import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { CreateCitaDto } from '../dto/create-cita.dto';

export function ApiCreateCitaAndDerivateTicketSwagger() {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiOperation({
      summary: 'Crear cita de soporte y derivar ticket a InSitu',
      description: `
Valida el token de bloqueo temporal (**SoftLock**), crea el registro definitivo de la cita de soporte (*citas_soporte*), cambia el estado del ticket a **Derivado InSitu**, consume/elimina el SoftLock y registra de forma inmutable el evento de auditoría.
      `,
    }),
    ApiBody({ type: CreateCitaDto }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Cita creada y ticket derivado exitosamente.',
      schema: {
        example: {
          id_cita: 1,
          id_ticket: 123,
          id_tecnico: 1,
          id_sucursal: 456,
          fecha_programada: '2026-10-15T00:00:00.000Z',
          hora_inicio: '1970-01-01T09:00:00.000Z',
          hora_fin: '1970-01-01T11:00:00.000Z',
          estado: 'Pendiente',
          observaciones: null,
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'El token de bloqueo no es válido o ya ha expirado.',
      schema: {
        example: {
          message: 'El tiempo de reserva para esta franja horaria ha expirado.',
          error: 'Bad Request',
          statusCode: 400,
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'El ticket especificado no fue encontrado.',
      schema: {
        example: {
          message: 'Ticket con ID 123 no encontrado.',
          error: 'Not Found',
          statusCode: 404,
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Token JWT no válido o no enviado.',
    }),
  );
}
