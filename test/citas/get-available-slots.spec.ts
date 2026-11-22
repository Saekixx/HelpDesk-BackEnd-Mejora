import type { GetAvailableSlotsUseCase } from '@/citas/application/use-case/softlock/get-available-slots.use-case';
import { beforeEach, describe, expect, it } from 'vitest';

import {
  createCita,
  createCitasRepositoryMocks,
  createExpiredSoftLock,
  createGetAvailableSlotsUseCase,
  createVigenteSoftLock,
  FECHA_PRUEBA,
  FRANJAS_ESTANDAR,
  TestDomainException,
  type CitasRepositoryMocks,
} from './helpers';

describe('GetAvailableSlotsUseCase', () => {
  const idTecnico = 7;
  const idSucursal = 10;
  const franja09 = FRANJAS_ESTANDAR[0];
  const franja12 = FRANJAS_ESTANDAR[1];
  const franja15 = FRANJAS_ESTANDAR[2];

  let mocks: CitasRepositoryMocks;
  let useCase: GetAvailableSlotsUseCase;

  beforeEach(() => {
    mocks = createCitasRepositoryMocks();
    mocks.citaRepository.findByTecnicoAndFecha.mockResolvedValue([]);
    mocks.softLockRepository.findByTecnicoAndFecha.mockResolvedValue([]);
    useCase = createGetAvailableSlotsUseCase(mocks);
  });

  it('sin citas ni locks devuelve disponibles las 3 franjas estándar', async () => {
    const result = await useCase.execute(idTecnico, FECHA_PRUEBA, idSucursal);

    expect(result).toEqual(
      FRANJAS_ESTANDAR.map((franja) => ({ franja, disponible: true })),
    );
  });

  it.each([1, 2])(
    'con %i cita(s) de la MISMA sucursal en 09:00 la franja sigue disponible',
    async (cantidad) => {
      mocks.citaRepository.findByTecnicoAndFecha.mockResolvedValue(
        Array.from({ length: cantidad }, (_, index) =>
          createCita({
            id_ticket: 100 + index,
            id_tecnico: idTecnico,
            id_sucursal: idSucursal,
          }),
        ),
      );

      const result = await useCase.execute(
        idTecnico,
        FECHA_PRUEBA,
        idSucursal,
      );

      expect(result[0]).toEqual({ franja: franja09, disponible: true });
    },
  );

  it('con 3 citas de la MISMA sucursal en 09:00 agota el tope y la franja no está disponible', async () => {
    mocks.citaRepository.findByTecnicoAndFecha.mockResolvedValue(
      [101, 102, 103].map((id_ticket) =>
        createCita({
          id_ticket,
          id_tecnico: idTecnico,
          id_sucursal: idSucursal,
        }),
      ),
    );

    const result = await useCase.execute(idTecnico, FECHA_PRUEBA, idSucursal);

    expect(result[0]).toEqual({ franja: franja09, disponible: false });
    expect(result[1]).toEqual({ franja: franja12, disponible: true });
    expect(result[2]).toEqual({ franja: franja15, disponible: true });
  });

  it('con 1 cita de OTRA sucursal en 09:00 la franja no está disponible', async () => {
    mocks.citaRepository.findByTecnicoAndFecha.mockResolvedValue([
      createCita({
        id_ticket: 201,
        id_tecnico: idTecnico,
        id_sucursal: 999,
      }),
    ]);

    const result = await useCase.execute(idTecnico, FECHA_PRUEBA, idSucursal);

    expect(result[0]).toEqual({ franja: franja09, disponible: false });
  });

  it('un lock VIGENTE en la franja la bloquea', async () => {
    mocks.softLockRepository.findByTecnicoAndFecha.mockResolvedValue([
      createVigenteSoftLock({
        lock_token: 'lock-vigente-12',
        id_tecnico: idTecnico,
        franja: franja12,
      }),
    ]);

    const result = await useCase.execute(idTecnico, FECHA_PRUEBA, idSucursal);

    expect(result[1]).toEqual({ franja: franja12, disponible: false });
    expect(result[0].disponible).toBe(true);
    expect(result[2].disponible).toBe(true);
  });

  it('un lock EXPIRADO en la franja no la bloquea', async () => {
    mocks.softLockRepository.findByTecnicoAndFecha.mockResolvedValue([
      createExpiredSoftLock({
        lock_token: 'lock-expirado-09',
        id_tecnico: idTecnico,
        franja: franja09,
      }),
    ]);

    const result = await useCase.execute(idTecnico, FECHA_PRUEBA, idSucursal);

    expect(result).toEqual(
      FRANJAS_ESTANDAR.map((franja) => ({ franja, disponible: true })),
    );
  });

  it('mezcla de citas de la misma sucursal y de otra sucursal deja la franja no disponible', async () => {
    mocks.citaRepository.findByTecnicoAndFecha.mockResolvedValue([
      createCita({
        id_ticket: 301,
        id_tecnico: idTecnico,
        id_sucursal: idSucursal,
      }),
      createCita({
        id_ticket: 302,
        id_tecnico: idTecnico,
        id_sucursal: 999,
      }),
    ]);

    const result = await useCase.execute(idTecnico, FECHA_PRUEBA, idSucursal);

    expect(result[0]).toEqual({ franja: franja09, disponible: false });
  });

  it('hora_inicio UTC 10:00 no mapea a franja estándar y no cuenta como ocupante', async () => {
    // Comportamiento real: mapearHoraAFranja usa getUTCHours(); 10 -> '' y esa
    // cita no se cuenta en ninguna de las tres franjas estándar.
    mocks.citaRepository.findByTecnicoAndFecha.mockResolvedValue([
      createCita({
        id_ticket: 401,
        id_tecnico: idTecnico,
        id_sucursal: idSucursal,
        hora_inicio: new Date('2026-11-21T10:00:00Z'),
      }),
    ]);

    const result = await useCase.execute(idTecnico, FECHA_PRUEBA, idSucursal);

    expect(result).toEqual(
      FRANJAS_ESTANDAR.map((franja) => ({ franja, disponible: true })),
    );
  });

  it('consulta ambos repositorios con el técnico y new Date("2026-11-21T00:00:00")', async () => {
    const fechaDate = new Date('2026-11-21T00:00:00');

    await useCase.execute(idTecnico, FECHA_PRUEBA, idSucursal);

    expect(mocks.citaRepository.findByTecnicoAndFecha).toHaveBeenCalledTimes(1);
    expect(mocks.citaRepository.findByTecnicoAndFecha).toHaveBeenCalledWith(
      idTecnico,
      fechaDate,
    );
    expect(
      mocks.softLockRepository.findByTecnicoAndFecha,
    ).toHaveBeenCalledTimes(1);
    expect(mocks.softLockRepository.findByTecnicoAndFecha).toHaveBeenCalledWith(
      idTecnico,
      fechaDate,
    );
  });

  it('propaga TestDomainException desde el repositorio de citas', async () => {
    const error = new TestDomainException('fallo de dominio en citas');
    mocks.citaRepository.findByTecnicoAndFecha.mockRejectedValue(error);

    const promise = useCase.execute(idTecnico, FECHA_PRUEBA, idSucursal);

    await expect(promise).rejects.toBeInstanceOf(TestDomainException);
    await expect(promise).rejects.toBe(error);
  });

  it('propaga un Error plano desde el repositorio de locks', async () => {
    const error = new Error('fallo inesperado en locks');
    mocks.softLockRepository.findByTecnicoAndFecha.mockRejectedValue(error);

    const promise = useCase.execute(idTecnico, FECHA_PRUEBA, idSucursal);

    await expect(promise).rejects.toBeInstanceOf(Error);
    await expect(promise).rejects.toBe(error);
  });
});
