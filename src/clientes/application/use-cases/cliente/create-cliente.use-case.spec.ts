import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateClienteUseCase } from './create-cliente.use-case';
import { CLIENTE_REPOSITORY } from '@/clientes/domain/ports/cliente.repository.port';
import { Cliente, TipoCliente } from '@/clientes/domain/entities/cliente.entity';
import { CreateClienteDto } from '@/clientes/application/dto/create-cliente.dto';
import { DocumentoAlreadyInUseException } from '@/clientes/domain/exceptions/cliente.exceptions';

describe('CreateClienteUseCase', () => {
  let useCase: CreateClienteUseCase;
  let clienteRepository: {
    existsByDocumento: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };

  const baseDto: CreateClienteDto = {
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
    sucursal_principal: { nombre: 'Sucursal Central' },
  };

  beforeEach(async () => {
    clienteRepository = {
      existsByDocumento: vi.fn().mockResolvedValue(false),
      create: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateClienteUseCase,
        { provide: CLIENTE_REPOSITORY, useValue: clienteRepository },
      ],
    }).compile();

    useCase = module.get(CreateClienteUseCase);
  });

  it('crea el cliente junto con su sucursal principal, rellenando campos opcionales vacíos', async () => {
    const created = new Cliente({ ...baseDto, is_active: true });
    clienteRepository.create.mockResolvedValue(created);

    const result = await useCase.execute(baseDto);

    expect(clienteRepository.create).toHaveBeenCalledWith(expect.any(Cliente), {
      principal: {
        nombre_sucursal: 'Sucursal Central',
        encargado: '',
        telefono: '',
        correo: '',
        direccion: '',
      },
      adicionales: [],
    });
    expect(result).toBe(created);
  });

  it('normaliza las sucursales adicionales informadas', async () => {
    clienteRepository.create.mockResolvedValue(
      new Cliente({ ...baseDto, is_active: true }),
    );

    const dto: CreateClienteDto = {
      ...baseDto,
      sucursal_principal: {
        nombre: 'Sucursal Central',
        encargado: 'Juan Pérez',
        telefono: '+51987654321',
        correo: 'central@acme.com',
        direccion: 'Jr. Los Pinos 456',
      },
      sucursales_adicionales: [
        { nombre: 'Sucursal Norte' },
        { nombre: 'Sucursal Sur', telefono: '+51999999999' },
      ],
    };

    await useCase.execute(dto);

    expect(clienteRepository.create).toHaveBeenCalledWith(expect.any(Cliente), {
      principal: {
        nombre_sucursal: 'Sucursal Central',
        encargado: 'Juan Pérez',
        telefono: '+51987654321',
        correo: 'central@acme.com',
        direccion: 'Jr. Los Pinos 456',
      },
      adicionales: [
        {
          nombre_sucursal: 'Sucursal Norte',
          encargado: '',
          telefono: '',
          correo: '',
          direccion: '',
        },
        {
          nombre_sucursal: 'Sucursal Sur',
          encargado: '',
          telefono: '+51999999999',
          correo: '',
          direccion: '',
        },
      ],
    });
  });

  it('asigna is_active: true por defecto en el cliente', async () => {
    clienteRepository.create.mockResolvedValue(
      new Cliente({ ...baseDto, is_active: true }),
    );

    await useCase.execute(baseDto);

    const [clienteArg] = clienteRepository.create.mock.calls[0];
    expect(clienteArg.is_active).toBe(true);
  });

  it('lanza DocumentoAlreadyInUseException si el numero_documento ya está en uso', async () => {
    clienteRepository.existsByDocumento.mockResolvedValue(true);

    await expect(useCase.execute(baseDto)).rejects.toThrow(
      DocumentoAlreadyInUseException,
    );
    expect(clienteRepository.create).not.toHaveBeenCalled();
  });
});