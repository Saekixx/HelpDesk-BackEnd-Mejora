import { CreateClienteDto } from './create-cliente.dto';
import {
  SucursalAnidadaDto,
  UpdateSucursalAnidadaDto,
} from '@/clientes/domain/dto/sucursal-anidada.dto';

// Actualización parcial de un cliente (PATCH /clientes/:id).
export type UpdateClienteDto = Partial<
  Omit<CreateClienteDto, 'sucursal_principal' | 'sucursales_adicionales'>
> & {
  sucursal_principal?: UpdateSucursalAnidadaDto;
  sucursales_adicionales?: SucursalAnidadaDto[];
};