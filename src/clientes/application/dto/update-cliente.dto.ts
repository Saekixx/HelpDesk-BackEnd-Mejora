import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateClienteDto, SucursalAnidadaDto } from './create-cliente.dto';
import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateSucursalAnidadaDto extends PartialType(SucursalAnidadaDto) {}

export class UpdateClienteBaseDto extends PartialType(
  OmitType(CreateClienteDto, ['sucursal_principal', 'sucursales_adicionales'] as const)
) {}

export class UpdateClienteDto extends UpdateClienteBaseDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateSucursalAnidadaDto)
  sucursal_principal?: UpdateSucursalAnidadaDto;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => SucursalAnidadaDto)
  sucursales_adicionales?: SucursalAnidadaDto[];
}