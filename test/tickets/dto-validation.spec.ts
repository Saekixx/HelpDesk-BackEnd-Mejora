import { validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { describe, expect, it } from 'vitest';

import { CerrarTicketDto } from '@/tickets/infrastructure/dtos/close-ticket.request';
import { CreateTicketDto } from '@/tickets/infrastructure/dtos/create-ticket.dto';
import { GetTicketsFilterDto } from '@/tickets/infrastructure/dtos/get-tickets-query.dto';
import { ReabrirTicketDto } from '@/tickets/infrastructure/dtos/reopen-ticket.request';

/**
 * Estas pruebas validan los DTOs sin el `enableImplicitConversion` global.
 * Así se pueden verificar las restricciones de tipo que, en la app, la
 * conversión implícita aplica antes de class-validator.
 */
describe('DTOs de tickets - class-validator', () => {
  it('CreateTicketDto exige asunto, detalle y equipoId entero', () => {
    const dto = plainToInstance(CreateTicketDto, {
      asunto: '',
      detalle: '',
      equipoId: 1.5,
    });

    const errors = validateSync(dto);
    const constraints = errors.map((error) => error.constraints ?? {});

    expect(constraints).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ isNotEmpty: 'asunto should not be empty' }),
        expect.objectContaining({ isNotEmpty: 'detalle should not be empty' }),
        expect.objectContaining({
          isInt: 'equipoId must be an integer number',
        }),
      ]),
    );
  });

  it('CreateTicketDto valida esSoftware como booleano cuando se envía', () => {
    const dto = plainToInstance(CreateTicketDto, {
      asunto: 'Asunto',
      detalle: 'Detalle',
      equipoId: 3,
      esSoftware: 'si',
    });

    const errors = validateSync(dto);
    const esSoftwareError = errors.find((error) => error.property === 'esSoftware');

    expect(esSoftwareError?.constraints?.isBoolean).toBe(
      'esSoftware must be a boolean value',
    );
  });

  it('CreateTicketDto acepta un body válido sin esSoftware', () => {
    const dto = plainToInstance(CreateTicketDto, {
      asunto: 'Asunto',
      detalle: 'Detalle',
      equipoId: 3,
    });

    expect(validateSync(dto)).toEqual([]);
  });

  it('CerrarTicketDto exige un reporte no vacío', () => {
    const empty = plainToInstance(CerrarTicketDto, { reporte_cierre: '' });
    expect(validateSync(empty)[0]?.constraints?.isNotEmpty).toBe(
      'reporte_cierre should not be empty',
    );

    const wrongType = plainToInstance(CerrarTicketDto, {
      reporte_cierre: 123,
    });
    expect(validateSync(wrongType)[0]?.constraints?.isString).toBe(
      'reporte_cierre must be a string',
    );
  });

  it('ReabrirTicketDto usa mensajes personalizados para tipo y obligatoriedad', () => {
    const wrongType = plainToInstance(ReabrirTicketDto, {
      motivo_reapertura: 123,
    });
    const wrongTypeConstraints = validateSync(wrongType)[0]?.constraints ?? {};
    expect(wrongTypeConstraints.isString).toBe(
      'El motivo de reapertura debe ser una cadena de texto.',
    );

    const empty = plainToInstance(ReabrirTicketDto, {
      motivo_reapertura: '',
    });
    const emptyConstraints = validateSync(empty)[0]?.constraints ?? {};
    expect(emptyConstraints.isNotEmpty).toBe(
      'El motivo de reapertura es obligatorio.',
    );
  });

  it('GetTicketsFilterDto valida enum, enteros y mínimos de paginación', () => {
    const dto = plainToInstance(GetTicketsFilterDto, {
      estado: 'ESTADO_INEXISTENTE',
      id_cliente: 1.5,
      page: 0,
      limit: 0,
    });

    const errors = validateSync(dto);
    const byProperty = new Map(
      errors.map((error) => [error.property, error.constraints ?? {}]),
    );

    expect(byProperty.get('estado')?.isEnum).toBe(
      'estado must be one of the following values: Pendiente, Asignado, En Progreso, Reabierto, Cerrado, Derivado InSitu, En Espera Repuesto',
    );
    expect(byProperty.get('id_cliente')?.isInt).toBe(
      'id_cliente must be an integer number',
    );
    expect(byProperty.get('page')?.min).toBe('page must not be less than 1');
    expect(byProperty.get('limit')?.min).toBe('limit must not be less than 1');
  });

  it('GetTicketsFilterDto aplica los Transform de búsqueda y IDs', () => {
    const dto = plainToInstance(GetTicketsFilterDto, {
      search: '  impresora  ',
      estado: '--',
      id_cliente: '3',
      id_sucursal: 'abc',
    });

    expect(dto.search).toBe('impresora');
    expect(dto.estado).toBeUndefined();
    expect(dto.id_cliente).toBe(3);
    expect(dto.id_sucursal).toBeUndefined();
    expect(validateSync(dto)).toEqual([]);
  });
});
