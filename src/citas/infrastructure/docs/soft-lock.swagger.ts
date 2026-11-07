import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { CreateSoftLockDto } from '../dto/create-softlock.dto';

export function ApiGetAvailableSlotsSwagger() {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiOperation({
      summary: 'Obtener franjas de horario disponibles de un técnico',
      description:
        'Consulta las franjas horarias estándar de un técnico en una fecha específica, cruzando la información con citas ya agendadas y locks activos.',
    }),
    ApiQuery({
      name: 'id_tecnico',
      description: 'ID numérico del técnico',
      example: 1,
      type: Number,
    }),
    ApiQuery({
      name: 'fecha',
      description: 'Fecha a consultar en formato YYYY-MM-DD',
      example: '2026-10-15',
      type: String,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Listado de franjas horarias devuelto exitosamente.',
      schema: {
        example: [
          { franja: '09:00 - 11:00', disponible: true },
          { franja: '11:00 - 13:00', disponible: false },
          { franja: '14:00 - 16:00', disponible: true },
          { franja: '16:00 - 18:00', disponible: true },
        ],
      },
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Token JWT no válido o no enviado.',
    }),
  );
}

export function ApiCreateSoftLockSwagger() {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiOperation({
      summary: 'Crear un bloqueo temporal (SoftLock)',
      description:
        'Genera un token temporal (`lock_token`) con una vigencia de 5 minutos para reservar una franja horaria y evitar conflictos de doble reserva.',
    }),
    ApiBody({ type: CreateSoftLockDto }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'SoftLock creado exitosamente.',
      schema: {
        example: {
          lock_token: 'lock_a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          expires_at: '2026-10-15T10:05:00.000Z',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description:
        'La franja horaria ya cuenta con un lock activo o datos inválidos.',
      schema: {
        example: {
          message:
            'Ya existe un lock activo para esta franja horaria y técnico.',
          error: 'Bad Request',
          statusCode: 400,
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Token JWT no válido o no enviado.',
    }),
  );
}
