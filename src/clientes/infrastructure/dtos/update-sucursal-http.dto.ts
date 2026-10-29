import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateSucursalHttpDto } from './create-sucursal-http.dto';
import { UpdateSucursalEncargadoDto } from './update-sucursal-encargado.dto';
import { UpdateSucursalDto } from '@/clientes/domain/dto/update-sucursal.dto';

// Body de PATCH /sucursales/:id. Todos los campos son opcionales.
// PartialType reutiliza los validadores y la documentación Swagger de
// CreateSucursalHttpDto para id_cliente, nombre_sucursal, direccion e id_zona
// (null desasigna la zona). `is_active` no se hereda porque el estado se
// cambia con el endpoint de toggle, y `encargado` se redefine porque aquí es
// parcial (UpdateSucursalEncargadoDto).
export class UpdateSucursalHttpDto
  extends PartialType(
    OmitType(CreateSucursalHttpDto, ['encargado', 'is_active'] as const),
  )
  implements UpdateSucursalDto
{
  @ApiPropertyOptional({
    description:
      'Datos del encargado local a actualizar. Solo se modifican los campos enviados.',
    type: UpdateSucursalEncargadoDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateSucursalEncargadoDto)
  readonly encargado?: UpdateSucursalEncargadoDto;
}
