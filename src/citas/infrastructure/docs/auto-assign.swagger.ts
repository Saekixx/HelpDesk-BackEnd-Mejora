import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { AutoAssignResultDto } from '../dto/auto-assign-response.dto';

export function ApiAutoAssignInsituSwagger() {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiOperation({
      summary: 'Autoasignar técnico y franja óptima para soporte In-Situ',
      description: `
Evalúa las reglas de zona, disponibilidad de agenda, carga laboral y **afinidad por sucursal** (agrupando hasta 3 tickets en la misma franja) para recomendar automáticamente al mejor técnico y horario disponible.
      `,
    }),
    ApiQuery({
      name: 'id_sucursal',
      description: 'ID numérico de la sucursal',
      example: 456,
      type: Number,
    }),
    ApiQuery({
      name: 'fecha',
      description: 'Fecha en formato YYYY-MM-DD',
      example: '2026-10-15',
      type: String,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Recomendación de autoasignación generada exitosamente.',
      type: AutoAssignResultDto,
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description:
        'No hay técnicos disponibles en la zona o las franjas están llenas.',
      schema: {
        example: {
          message:
            'No hay técnicos de soporte in-situ disponibles en la zona de esta sucursal.',
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
