import { describe, it, expect } from 'vitest';
import { EquipoMapper } from './equipo.mapper';

describe('EquipoMapper', () => {
  describe('toDomain', () => {
    it('mapea un registro de Prisma a la entidad de dominio Equipo', () => {
      const prismaEquipo = {
        id_equipo: 1,
        tipo: 'Laptop',
        marca: 'Dell',
        num_serie: 'SN-001',
        nombre_usuario: 'Carlos Ramírez',
        ult_revision: new Date('2026-06-01'),
        rev_programada: new Date('2026-12-01'),
        id_trabajador: 5,
        id_cliente: 1,
        id_sucursal: 1,
        id_area: 1,
        is_active: true,
        created_at: new Date('2026-01-01'),
        updated_at: new Date('2026-01-02'),
      } as any;

      const equipo = EquipoMapper.toDomain(prismaEquipo);

      expect(equipo.id_equipo).toBe(1);
      expect(equipo.tipo).toBe('Laptop');
      expect(equipo.marca).toBe('Dell');
      expect(equipo.num_serie).toBe('SN-001');
      expect(equipo.nombre_usuario).toBe('Carlos Ramírez');
      expect(equipo.id_trabajador).toBe(5);
      expect(equipo.id_cliente).toBe(1);
      expect(equipo.id_sucursal).toBe(1);
      expect(equipo.id_area).toBe(1);
      expect(equipo.is_active).toBe(true);
      expect(equipo.createdAt).toEqual(new Date('2026-01-01'));
      expect(equipo.updatedAt).toEqual(new Date('2026-01-02'));
    });

    it('normaliza campos opcionales nulos a undefined e is_active nulo a true', () => {
      const prismaEquipo = {
        id_equipo: 2,
        tipo: 'Impresora',
        marca: 'HP',
        num_serie: null,
        nombre_usuario: null,
        ult_revision: null,
        rev_programada: null,
        id_trabajador: null,
        id_cliente: null,
        id_sucursal: null,
        id_area: null,
        is_active: null,
        created_at: null,
        updated_at: null,
      } as any;

      const equipo = EquipoMapper.toDomain(prismaEquipo);

      expect(equipo.num_serie).toBeUndefined();
      expect(equipo.nombre_usuario).toBeUndefined();
      expect(equipo.id_trabajador).toBeUndefined();
      expect(equipo.id_cliente).toBeUndefined();
      expect(equipo.id_sucursal).toBeUndefined();
      expect(equipo.id_area).toBeUndefined();
      expect(equipo.is_active).toBe(true);
    });
  });

  describe('toListItem', () => {
    it('mapea las relaciones resumidas de cliente, sucursal, área y trabajador', () => {
      const prismaEquipoConDetalle = {
        id_equipo: 1,
        tipo: 'Laptop',
        marca: 'Dell',
        num_serie: 'SN-001',
        nombre_usuario: null,
        ult_revision: null,
        rev_programada: null,
        id_trabajador: 5,
        id_cliente: 1,
        id_sucursal: 1,
        id_area: 1,
        is_active: true,
        created_at: new Date('2026-01-01'),
        updated_at: new Date('2026-01-01'),
        clientes: { id_cliente: 1, nombre_principal: 'Acme Corp SAC' },
        sucursales: { id_sucursal: 1, nombre_sucursal: 'Sucursal Central' },
        area: { id_area: 1, nombre_area: 'Sistemas' },
        usuarios: { id_usuario: 5, nombre: 'Juan', apellido: 'Pérez' },
      } as any;

      const item = EquipoMapper.toListItem(prismaEquipoConDetalle);

      expect(item.cliente).toEqual({ id: 1, nombre: 'Acme Corp SAC' });
      expect(item.sucursal).toEqual({ id: 1, nombre: 'Sucursal Central' });
      expect(item.area).toEqual({ id: 1, nombre: 'Sistemas' });
      expect(item.trabajador).toEqual({ id: 5, nombre: 'Juan Pérez' });
    });

    it('retorna null en las relaciones cuando el equipo no tiene asignación', () => {
      const prismaEquipoConDetalle = {
        id_equipo: 2,
        tipo: 'Impresora',
        marca: 'HP',
        num_serie: null,
        nombre_usuario: null,
        ult_revision: null,
        rev_programada: null,
        id_trabajador: null,
        id_cliente: null,
        id_sucursal: null,
        id_area: null,
        is_active: true,
        created_at: new Date('2026-01-01'),
        updated_at: new Date('2026-01-01'),
        clientes: null,
        sucursales: null,
        area: null,
        usuarios: null,
      } as any;

      const item = EquipoMapper.toListItem(prismaEquipoConDetalle);

      expect(item.cliente).toBeNull();
      expect(item.sucursal).toBeNull();
      expect(item.area).toBeNull();
      expect(item.trabajador).toBeNull();
    });
  });
});