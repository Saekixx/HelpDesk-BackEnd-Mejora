import { DomainException } from '@/common/domain/domain.exception';
import type { PrismaService } from '@/common/infrastructure/prisma/prisma.service';
import { AutoAssignInsituUseCase } from '@/citas/application/use-case/citas/auto-assign-insitu.use-case';
import { GetAvailableSlotsUseCase } from '@/citas/application/use-case/softlock/get-available-slots.use-case';
import {
  CitaSoporte,
  type CitaEstado,
} from '@/citas/domain/entity/cita-soporte.entity';
import { SoftLock } from '@/citas/domain/entity/soft-lock.entity';
import type { CitaSoporteRepositoryPort } from '@/citas/domain/port/cita-soporte.repository.port';
import type { SoftLockRepositoryPort } from '@/citas/domain/port/soft-lock.repository.port';
import { UserRole } from '@/usuarios/domain/enum/user-role.enum';
import { type Mock, vi } from 'vitest';

/** Excepción de dominio definida solo en el test; no toca código de aplicación. */
export class TestDomainException extends DomainException {}

export const FECHA_PRUEBA = '2026-11-21';

export const FRANJAS_ESTANDAR = [
  '09:00 - 12:00',
  '12:00 - 15:00',
  '15:00 - 18:00',
] as const;

export interface CitaTestOverrides {
  id_ticket?: number;
  id_tecnico?: number;
  id_sucursal?: number;
  fecha_programada?: Date;
  hora_inicio?: Date;
  estado?: CitaEstado | null;
}

/** Cita de prueba con hora 09:00 UTC, que mapea a la primera franja estándar. */
export function createCita(overrides: CitaTestOverrides = {}): CitaSoporte {
  return new CitaSoporte({
    id_ticket: overrides.id_ticket ?? 100,
    id_tecnico: overrides.id_tecnico ?? 1,
    id_sucursal: overrides.id_sucursal ?? 10,
    fecha_programada:
      overrides.fecha_programada ?? new Date('2026-11-21T00:00:00Z'),
    hora_inicio: overrides.hora_inicio ?? new Date('2026-11-21T09:00:00Z'),
    estado: overrides.estado ?? 'Pendiente',
  });
}

export interface SoftLockTestOverrides {
  lock_token?: string;
  id_tecnico?: number;
  fecha?: Date;
  franja?: string;
  expires_at?: Date;
}

export function createSoftLock(
  overrides: SoftLockTestOverrides = {},
): SoftLock {
  return new SoftLock({
    lock_token: overrides.lock_token ?? 'lock-token-test',
    id_tecnico: overrides.id_tecnico ?? 1,
    fecha: overrides.fecha ?? new Date('2026-11-21T00:00:00Z'),
    franja: overrides.franja ?? FRANJAS_ESTANDAR[0],
    expires_at: overrides.expires_at ?? new Date('2099-01-01T00:00:00Z'),
  });
}

/** Lock vigente: expires_at muy por encima de la fecha actual del entorno. */
export function createVigenteSoftLock(
  overrides: Omit<SoftLockTestOverrides, 'expires_at'> = {},
): SoftLock {
  return createSoftLock({
    ...overrides,
    expires_at: new Date('2099-01-01T00:00:00Z'),
  });
}

/** Lock expirado: expires_at muy por debajo de la fecha actual del entorno. */
export function createExpiredSoftLock(
  overrides: Omit<SoftLockTestOverrides, 'expires_at'> = {},
): SoftLock {
  return createSoftLock({
    ...overrides,
    expires_at: new Date('2000-01-01T00:00:00Z'),
  });
}

export interface CitaRepositoryMock {
  save: Mock;
  findById: Mock;
  findByTicketId: Mock;
  findByTecnicoAndFecha: Mock;
  hasAppointment: Mock;
}

export interface SoftLockRepositoryMock {
  findByToken: Mock;
  findByTecnicoAndFecha: Mock;
  save: Mock;
  deleteByToken: Mock;
  deleteExpired: Mock;
}

export interface CitasRepositoryMocks {
  citaRepository: CitaRepositoryMock;
  softLockRepository: SoftLockRepositoryMock;
}

export function createCitasRepositoryMocks(): CitasRepositoryMocks {
  return {
    citaRepository: {
      save: vi.fn(),
      findById: vi.fn(),
      findByTicketId: vi.fn(),
      findByTecnicoAndFecha: vi.fn(),
      hasAppointment: vi.fn(),
    },
    softLockRepository: {
      findByToken: vi.fn(),
      findByTecnicoAndFecha: vi.fn(),
      save: vi.fn(),
      deleteByToken: vi.fn(),
      deleteExpired: vi.fn(),
    },
  };
}

export interface SucursalRow {
  id_sucursal: number;
  id_zona: number | null;
  nombre_sucursal: string;
}

export interface TecnicoZonaRow {
  usuarios: {
    id_usuario: number;
    nombre: string;
    apellido: string;
    is_active: boolean;
    rol: { nombre: string };
  };
}

export interface PrismaMock {
  sucursales: { findUnique: Mock };
  tecnicos_zonas: { findMany: Mock };
}

export function createPrismaMock(): PrismaMock {
  return {
    sucursales: { findUnique: vi.fn() },
    tecnicos_zonas: { findMany: vi.fn() },
  };
}

export function createSucursalRow(
  overrides: Partial<SucursalRow> = {},
): SucursalRow {
  return {
    id_sucursal: overrides.id_sucursal ?? 10,
    id_zona: overrides.id_zona !== undefined ? overrides.id_zona : 5,
    nombre_sucursal: overrides.nombre_sucursal ?? 'Sucursal Centro',
  };
}

export interface TecnicoZonaOverrides {
  id_usuario?: number;
  nombre?: string;
  apellido?: string;
  is_active?: boolean;
  rolNombre?: string;
}

export function createTecnicoZonaRow(
  overrides: TecnicoZonaOverrides = {},
): TecnicoZonaRow {
  return {
    usuarios: {
      id_usuario: overrides.id_usuario ?? 1,
      nombre: overrides.nombre ?? 'Ana',
      apellido: overrides.apellido ?? 'Pérez',
      is_active: overrides.is_active ?? true,
      rol: { nombre: overrides.rolNombre ?? UserRole.SOPORTE_INSITU },
    },
  };
}

export function createGetAvailableSlotsUseCase(
  mocks: CitasRepositoryMocks = createCitasRepositoryMocks(),
): GetAvailableSlotsUseCase {
  return new GetAvailableSlotsUseCase(
    mocks.citaRepository as unknown as CitaSoporteRepositoryPort,
    mocks.softLockRepository as unknown as SoftLockRepositoryPort,
  );
}

export function createAutoAssignInsituUseCase(
  prisma: PrismaMock = createPrismaMock(),
  mocks: CitasRepositoryMocks = createCitasRepositoryMocks(),
): AutoAssignInsituUseCase {
  return new AutoAssignInsituUseCase(
    prisma as unknown as PrismaService,
    mocks.citaRepository as unknown as CitaSoporteRepositoryPort,
    mocks.softLockRepository as unknown as SoftLockRepositoryPort,
  );
}
