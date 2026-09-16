import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PrismaService } from '@/common/infrastructure/prisma/prisma.service';
import { ClientePrismaRepository } from './cliente-prisma.repository';
import { ClienteNotFoundException } from '@/clientes/domain/exceptions/cliente.exceptions';
import { Cliente, TipoCliente } from '@/clientes/domain/entities/cliente.entity';

describe('ClientePrismaRepository', () => {
  let repository: ClientePrismaRepository;
  let tx: {
    clientes: {
      create: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
    sucursales: {
      create: ReturnType<typeof vi.fn>;
      createMany: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
  };
  let prisma: {
    clientes: { findUnique: ReturnType<typeof vi.fn> };
    $transaction: ReturnType<typeof vi.fn>;
  };

  const clienteDomain = new Cliente({
    tipo_cliente: TipoCliente.JURIDICA,
    numero_documento: '20123456789',
    nombre_principal: 'Acme Corp SAC',
    direccion: 'Av. Siempre Viva 123',
    telefono: '+51987654321',
    correo: 'contacto@acme.com',
    rubro: 'Retail',
    fecha_inicio_plan: new Date('2026-01-01'),
    fecha_finalizacion_plan: new Date('2026-12-31'),
    costo_negociado: 1500.5,
    limite_equipos_contratado: 20,
    id_plan: 1,
    is_active: true,
  });

  const prismaClienteCreado = {
    id_cliente: 1,
    tipo_cliente: 'JURIDICA',
    numero_documento: '20123456789',
    nombre_principal: 'Acme Corp SAC',
    direccion: 'Av. Siempre Viva 123',
    telefono: '+51987654321',
    correo: 'contacto@acme.com',
    rubro: 'Retail',
    fecha_inicio_plan: new Date('2026-01-01'),
    fecha_finalizacion_plan: new Date('2026-12-31'),
    costo_negociado: 1500.5,
    limite_equipos_contratado: 20,
    id_plan: 1,
    is_active: true,
    fecha_registro: new Date('2026-01-01'),
    created_at: new Date('2026-01-01'),
    updated_at: new Date('2026-01-01'),
  };

  beforeEach(async () => {
    tx = {
      clientes: {
        create: vi.fn().mockResolvedValue(prismaClienteCreado),
        update: vi.fn().mockResolvedValue(prismaClienteCreado),
      },
      sucursales: {
        create: vi.fn().mockResolvedValue({}),
        createMany: vi.fn().mockResolvedValue({ count: 0 }),
        findFirst: vi.fn().mockResolvedValue(null),
        update: vi.fn().mockResolvedValue({}),
      },
    };

    prisma = {
      clientes: { findUnique: vi.fn() },
      $transaction: vi.fn((callback: (tx: unknown) => unknown) => callback(tx)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientePrismaRepository,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    repository = module.get(ClientePrismaRepository);
  });

  describe('create', () => {
    it('crea el cliente y su sucursal principal dentro de la misma transacción', async () => {
      await repository.create(clienteDomain, {
        principal: {
          nombre_sucursal: 'Sucursal Central',
          encargado: 'Juan Pérez',
          telefono: '+51987654321',
          correo: 'central@acme.com',
          direccion: 'Jr. Los Pinos 456',
        },
        adicionales: [],
      });

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(tx.clientes.create).toHaveBeenCalled();
      expect(tx.sucursales.create).toHaveBeenCalledWith({
        data: {
          nombre_sucursal: 'Sucursal Central',
          encargado: 'Juan Pérez',
          telefono: '+51987654321',
          correo: 'central@acme.com',
          direccion: 'Jr. Los Pinos 456',
          id_cliente: 1,
          is_active: true,
          is_principal: true,
        },
      });
      expect(tx.sucursales.createMany).not.toHaveBeenCalled();
    });

    it('crea las sucursales adicionales con createMany cuando vienen informadas', async () => {
      await repository.create(clienteDomain, {
        principal: {
          nombre_sucursal: 'Sucursal Central',
          encargado: '',
          telefono: '',
          correo: '',
          direccion: '',
        },
        adicionales: [
          {
            nombre_sucursal: 'Sucursal Norte',
            encargado: '',
            telefono: '',
            correo: '',
            direccion: '',
          },
        ],
      });

      expect(tx.sucursales.createMany).toHaveBeenCalledWith({
        data: [
          {
            nombre_sucursal: 'Sucursal Norte',
            encargado: '',
            telefono: '',
            correo: '',
            direccion: '',
            id_cliente: 1,
            is_active: true,
            is_principal: false,
          },
        ],
      });
    });
  });

  describe('update', () => {
    it('lanza ClienteNotFoundException si el cliente no existe', async () => {
      prisma.clientes.findUnique.mockResolvedValue(null);

      await expect(
        repository.update(999, clienteDomain, undefined),
      ).rejects.toThrow(ClienteNotFoundException);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('actualiza la sucursal principal existente cuando ya hay una marcada', async () => {
      prisma.clientes.findUnique.mockResolvedValue(prismaClienteCreado);
      tx.sucursales.findFirst.mockResolvedValue({
        id_sucursal: 10,
        is_principal: true,
      });

      await repository.update(1, clienteDomain, {
        principal: { telefono: '+51900000000' },
      });

      expect(tx.sucursales.findFirst).toHaveBeenCalledWith({
        where: { id_cliente: 1, is_principal: true },
      });
      expect(tx.sucursales.update).toHaveBeenCalledWith({
        where: { id_sucursal: 10 },
        data: { telefono: '+51900000000' },
      });
      expect(tx.sucursales.create).not.toHaveBeenCalled();
    });

    it('crea una sucursal principal nueva si el cliente no tenía ninguna marcada', async () => {
      prisma.clientes.findUnique.mockResolvedValue(prismaClienteCreado);
      tx.sucursales.findFirst.mockResolvedValue(null);

      await repository.update(1, clienteDomain, {
        principal: { telefono: '+51900000000' },
      });

      expect(tx.sucursales.create).toHaveBeenCalledWith({
        data: {
          nombre_sucursal: prismaClienteCreado.nombre_principal,
          encargado: '',
          telefono: '+51900000000',
          correo: '',
          direccion: '',
          id_cliente: 1,
          is_active: true,
          is_principal: true,
        },
      });
    });

    it('crea las sucursales adicionales nuevas con createMany', async () => {
      prisma.clientes.findUnique.mockResolvedValue(prismaClienteCreado);

      await repository.update(1, clienteDomain, {
        adicionales: [
          {
            nombre_sucursal: 'Sucursal Sur',
            encargado: '',
            telefono: '',
            correo: '',
            direccion: '',
          },
        ],
      });

      expect(tx.sucursales.createMany).toHaveBeenCalledWith({
        data: [
          {
            nombre_sucursal: 'Sucursal Sur',
            encargado: '',
            telefono: '',
            correo: '',
            direccion: '',
            id_cliente: 1,
            is_active: true,
            is_principal: false,
          },
        ],
      });
    });

    it('no toca sucursales si el parámetro no viene informado', async () => {
      prisma.clientes.findUnique.mockResolvedValue(prismaClienteCreado);

      await repository.update(1, clienteDomain);

      expect(tx.sucursales.findFirst).not.toHaveBeenCalled();
      expect(tx.sucursales.create).not.toHaveBeenCalled();
      expect(tx.sucursales.createMany).not.toHaveBeenCalled();
    });
  });
});