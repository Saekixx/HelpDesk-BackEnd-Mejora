import { NotFoundException } from '@nestjs/common';
import type { CitaSoporte } from '@/citas/domain/entity/cita-soporte.entity';
import type { SoftLock } from '@/citas/domain/entity/soft-lock.entity';
import { UserRole } from '@/usuarios/domain/enum/user-role.enum';
import { beforeEach, describe, expect, it } from 'vitest';

import {
  createAutoAssignInsituUseCase,
  createCita,
  createCitasRepositoryMocks,
  createExpiredSoftLock,
  createPrismaMock,
  createSucursalRow,
  createTecnicoZonaRow,
  createVigenteSoftLock,
  FECHA_PRUEBA,
  TestDomainException,
  type CitasRepositoryMocks,
  type PrismaMock,
} from './helpers';

const MSG_SUCURSAL_SIN_ZONA =
  'La sucursal no existe o no tiene una zona geográfica asignada.';
const MSG_SIN_TECNICOS =
  'No hay técnicos de soporte in-situ disponibles en la zona de esta sucursal.';
const MSG_FRAJAS_LLENAS =
  'Todos los técnicos de soporte in-situ en esta zona se encuentran sin disponibilidad (franjas llenas) para la fecha seleccionada.';

async function expectNotFound(
  promise: Promise<unknown>,
  message: string,
): Promise<void> {
  await expect(promise).rejects.toBeInstanceOf(NotFoundException);
  await expect(promise).rejects.toThrow(message);
}

describe('AutoAssignInsituUseCase', () => {
  const idSucursal = 10;
  const idZona = 5;
  const dto = { id_sucursal: idSucursal, fecha: FECHA_PRUEBA };
  const franja09 = '09:00 - 12:00';
  const franja12 = '12:00 - 15:00';

  const ana = createTecnicoZonaRow({
    id_usuario: 1,
    nombre: 'Ana',
    apellido: 'Pérez',
  });
  const bruno = createTecnicoZonaRow({
    id_usuario: 2,
    nombre: 'Bruno',
    apellido: 'Díaz',
  });

  let prisma: PrismaMock;
  let mocks: CitasRepositoryMocks;
  let useCase: ReturnType<typeof createAutoAssignInsituUseCase>;

  function setAgendas(
    agendas: Record<number, { citas?: CitaSoporte[]; locks?: SoftLock[] }>,
  ): void {
    mocks.citaRepository.findByTecnicoAndFecha.mockImplementation(
      async (id: number) => agendas[id]?.citas ?? [],
    );
    mocks.softLockRepository.findByTecnicoAndFecha.mockImplementation(
      async (id: number) => agendas[id]?.locks ?? [],
    );
  }

  beforeEach(() => {
    prisma = createPrismaMock();
    mocks = createCitasRepositoryMocks();

    prisma.sucursales.findUnique.mockResolvedValue(
      createSucursalRow({
        id_sucursal: idSucursal,
        id_zona: idZona,
        nombre_sucursal: 'Sucursal Centro',
      }),
    );
    prisma.tecnicos_zonas.findMany.mockResolvedValue([ana]);
    mocks.citaRepository.findByTecnicoAndFecha.mockResolvedValue([]);
    mocks.softLockRepository.findByTecnicoAndFecha.mockResolvedValue([]);

    useCase = createAutoAssignInsituUseCase(prisma, mocks);
  });

  it('agrupa por sucursal con 2 tickets en 09:00 y optimiza el desplazamiento', async () => {
    setAgendas({
      1: {
        citas: [
          createCita({
            id_ticket: 101,
            id_tecnico: 1,
            id_sucursal: idSucursal,
          }),
          createCita({
            id_ticket: 102,
            id_tecnico: 1,
            id_sucursal: idSucursal,
          }),
        ],
      },
    });

    const result = await useCase.execute(dto);

    expect(result).toMatchObject({
      id_tecnico: 1,
      nombre_tecnico: 'Ana Pérez',
      franja_recomendada: franja09,
      es_agrupado_por_sucursal: true,
    });
    expect(result.motivo_asignacion).toContain('2 ticket(s)');
    expect(result.motivo_asignacion).toContain('Sucursal Centro');
  });

  it('con 3 tickets en la misma franja y sucursal no agrupa y cae al fallback', async () => {
    setAgendas({
      1: {
        citas: [201, 202, 203].map((id_ticket) =>
          createCita({
            id_ticket,
            id_tecnico: 1,
            id_sucursal: idSucursal,
          }),
        ),
      },
    });

    const result = await useCase.execute(dto);

    expect(result.franja_recomendada).toBe(franja12);
    expect(result.es_agrupado_por_sucursal).toBe(false);
    expect(result.motivo_asignacion).toContain('menor carga operativa');
  });

  it('descarta en el fallback una franja ocupada por cita de OTRA sucursal', async () => {
    setAgendas({
      1: {
        citas: [
          createCita({
            id_ticket: 301,
            id_tecnico: 1,
            id_sucursal: 999,
          }),
        ],
      },
    });

    const result = await useCase.execute(dto);

    expect(result.franja_recomendada).toBe(franja12);
    expect(result.es_agrupado_por_sucursal).toBe(false);
  });

  it('el lock VIGENTE bloquea la franja en el fallback', async () => {
    setAgendas({
      1: {
        locks: [
          createVigenteSoftLock({
            lock_token: 'lock-vigente-09',
            id_tecnico: 1,
            franja: franja09,
          }),
        ],
      },
    });

    const result = await useCase.execute(dto);

    expect(result.franja_recomendada).toBe(franja12);
    expect(result.es_agrupado_por_sucursal).toBe(false);
  });

  it('el lock EXPIRADO no bloquea la franja en el fallback', async () => {
    setAgendas({
      1: {
        locks: [
          createExpiredSoftLock({
            lock_token: 'lock-expirado-09',
            id_tecnico: 1,
            franja: franja09,
          }),
        ],
      },
    });

    const result = await useCase.execute(dto);

    expect(result.franja_recomendada).toBe(franja09);
    expect(result.es_agrupado_por_sucursal).toBe(false);
  });

  it('fallback elige al técnico con MENOR carga y su primera franja libre', async () => {
    prisma.tecnicos_zonas.findMany.mockResolvedValue([ana, bruno]);
    setAgendas({
      1: {
        citas: [
          createCita({
            id_ticket: 401,
            id_tecnico: 1,
            id_sucursal: 999,
            hora_inicio: new Date('2026-11-21T09:00:00Z'),
          }),
          createCita({
            id_ticket: 402,
            id_tecnico: 1,
            id_sucursal: 999,
            hora_inicio: new Date('2026-11-21T12:00:00Z'),
          }),
        ],
      },
      2: {},
    });

    const result = await useCase.execute(dto);

    expect(result).toMatchObject({
      id_tecnico: 2,
      nombre_tecnico: 'Bruno Díaz',
      franja_recomendada: franja09,
      es_agrupado_por_sucursal: false,
    });
    expect(result.motivo_asignacion).toContain('menor carga operativa');
  });

  it('lanza NotFoundException si la sucursal no existe', async () => {
    prisma.sucursales.findUnique.mockResolvedValue(null);

    await expectNotFound(useCase.execute(dto), MSG_SUCURSAL_SIN_ZONA);
  });

  it('lanza NotFoundException si la sucursal no tiene id_zona', async () => {
    prisma.sucursales.findUnique.mockResolvedValue(
      createSucursalRow({
        id_sucursal: idSucursal,
        id_zona: null,
        nombre_sucursal: 'Sucursal sin zona',
      }),
    );

    await expectNotFound(useCase.execute(dto), MSG_SUCURSAL_SIN_ZONA);
  });

  it('filtra por is_active y rol SOPORTE_INSITU y lanza NotFoundException si no hay técnicos', async () => {
    prisma.tecnicos_zonas.findMany.mockResolvedValue([
      createTecnicoZonaRow({
        id_usuario: 3,
        nombre: 'Inactivo',
        apellido: 'Soporte',
        is_active: false,
        rolNombre: UserRole.SOPORTE_INSITU,
      }),
      createTecnicoZonaRow({
        id_usuario: 4,
        nombre: 'Otro',
        apellido: 'Rol',
        is_active: true,
        rolNombre: UserRole.SOPORTE_TECNICO,
      }),
    ]);

    await expectNotFound(useCase.execute(dto), MSG_SIN_TECNICOS);
  });

  it('lanza NotFoundException si todas las franjas de todos los técnicos están llenas', async () => {
    setAgendas({
      1: {
        citas: [
          createCita({
            id_ticket: 501,
            id_tecnico: 1,
            id_sucursal: 999,
            hora_inicio: new Date('2026-11-21T09:00:00Z'),
          }),
          createCita({
            id_ticket: 502,
            id_tecnico: 1,
            id_sucursal: 999,
            hora_inicio: new Date('2026-11-21T12:00:00Z'),
          }),
          createCita({
            id_ticket: 503,
            id_tecnico: 1,
            id_sucursal: 999,
            hora_inicio: new Date('2026-11-21T15:00:00Z'),
          }),
        ],
      },
    });

    await expectNotFound(useCase.execute(dto), MSG_FRAJAS_LLENAS);
  });

  it('propaga TestDomainException desde el repositorio de citas', async () => {
    const error = new TestDomainException('fallo de dominio en autoasignación');
    mocks.citaRepository.findByTecnicoAndFecha.mockRejectedValue(error);

    const promise = useCase.execute(dto);

    await expect(promise).rejects.toBeInstanceOf(TestDomainException);
    await expect(promise).rejects.toBe(error);
  });
});
