import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateClienteUseCase } from './update-cliente.use-case';
import { CLIENTE_REPOSITORY } from '@/clientes/domain/ports/cliente.repository.port';
import {
  Cliente,
  ClienteDetail,
  TipoCliente,
} from '@/clientes/domain/entities/cliente.entity';
import {
  ClienteNotFoundException,
  DocumentoAlreadyInUseException,
} from '@/clientes/domain/exceptions/cliente.exceptions';

describe('UpdateClienteUseCase', () => {
  let useCase: UpdateClienteUseCase;
  let clienteRepository: {
    findById: ReturnType<typeof vi.fn>;
    existsByDocumento: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };

  const currentCliente: ClienteDetail = {
    ...new Cliente({
      id_cliente: 1,
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
    }),
    plan: null,
    sucursales: [],
  };

  beforeEach(async () => {
    clienteRepository = {
      findById: vi.fn().mockResolvedValue(currentCliente),
      existsByDocumento: vi.fn().mockResolvedValue(false),
      update: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateClienteUseCase,
        { provide: CLIENTE_REPOSITORY, useValue: clienteRepository },
      ],
    }).compile();

    useCase = module.get(UpdateClienteUseCase);
  });

  it('actualiza el cliente sin tocar sucursales si no vienen en el dto', async () => {
    clienteRepository.update.mockResolvedValue(
      new Cliente({ ...currentCliente, nombre_principal: 'Acme Corp SAC 2' }),
    );

    await useCase.execute(1, { nombre_principal: 'Acme Corp SAC 2' });

    expect(clienteRepository.update).toHaveBeenCalledWith(
      1,
      expect.any(Cliente),
      { principal: undefined, adicionales: undefined },
    );
  });

  it('lanza ClienteNotFoundException si el cliente no existe', async () => {
    clienteRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute(999, { nombre_principal: 'X' }),
    ).rejects.toThrow(ClienteNotFoundException);
    expect(clienteRepository.update).not.toHaveBeenCalled();
  });

  it('valida numero_documento solo cuando cambia respecto al actual', async () => {
    clienteRepository.update.mockResolvedValue(currentCliente as unknown as Cliente);

    await useCase.execute(1, { numero_documento: '20123456789' });
    expect(clienteRepository.existsByDocumento).not.toHaveBeenCalled();

    await useCase.execute(1, { numero_documento: '20999999999' });
    expect(clienteRepository.existsByDocumento).toHaveBeenCalledWith(
      '20999999999',
    );
  });

  it('lanza DocumentoAlreadyInUseException si el nuevo numero_documento ya está en uso', async () => {
    clienteRepository.existsByDocumento.mockResolvedValue(true);

    await expect(
      useCase.execute(1, { numero_documento: '20999999999' }),
    ).rejects.toThrow(DocumentoAlreadyInUseException);
    expect(clienteRepository.update).not.toHaveBeenCalled();
  });

  it('normaliza únicamente los campos informados de sucursal_principal', async () => {
    clienteRepository.update.mockResolvedValue(currentCliente as unknown as Cliente);

    await useCase.execute(1, {
      sucursal_principal: { telefono: '+51900000000' },
    });

    expect(clienteRepository.update).toHaveBeenCalledWith(
      1,
      expect.any(Cliente),
      { principal: { telefono: '+51900000000' }, adicionales: undefined },
    );
  });

  it('normaliza sucursales_adicionales como nuevas sucursales completas', async () => {
    clienteRepository.update.mockResolvedValue(currentCliente as unknown as Cliente);

    await useCase.execute(1, {
      sucursales_adicionales: [{ nombre: 'Sucursal Sur' }],
    });

    expect(clienteRepository.update).toHaveBeenCalledWith(
      1,
      expect.any(Cliente),
      {
        principal: undefined,
        adicionales: [
          {
            nombre_sucursal: 'Sucursal Sur',
            encargado: '',
            telefono: '',
            correo: '',
            direccion: '',
          },
        ],
      },
    );
  });
});