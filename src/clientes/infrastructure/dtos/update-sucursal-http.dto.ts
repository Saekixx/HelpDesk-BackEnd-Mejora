import {
  ApiExtraModels,
  ApiPropertyOptional,
  getSchemaPath,
  OmitType,
  PartialType,
} from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { CreateSucursalHttpDto } from './create-sucursal-http.dto';
import { UpdateSucursalEncargadoDto } from './update-sucursal-encargado.dto';
import { UpdateSucursalDto } from '@/clientes/domain/dto/update-sucursal.dto';
import {
  IsEncargadoInput,
  toEncargadoInput,
} from '../validators/encargado-input.validator';

// Body de PATCH /sucursales/:id. Todos los campos son opcionales.
// PartialType reutiliza los validadores y la documentación Swagger de
// CreateSucursalHttpDto para id_cliente, nombre_sucursal, direccion e id_zona
// (null desasigna la zona). `is_active` no se hereda porque el estado se
// cambia con el endpoint de toggle, y `encargado` se redefine porque aquí es
// parcial y admite dos formas: un string con el nombre completo o el objeto
// UpdateSucursalEncargadoDto.
@ApiExtraModels(UpdateSucursalEncargadoDto)
export class UpdateSucursalHttpDto
  extends PartialType(
    OmitType(CreateSucursalHttpDto, ['encargado', 'is_active'] as const),
  )
  implements UpdateSucursalDto
{
  @ApiPropertyOptional({
    description:
      'Encargado local de la sucursal. Acepta una de dos formas: (1) un string con el nombre completo, que se separa en nombre (primera palabra) y apellido (el resto) y solo actualiza esos dos datos; o (2) un objeto con `nombre`, `apellido`, `telefono_contacto` y `correo_corporativo`, donde solo se modifican los campos enviados.',
    oneOf: [
      {
        type: 'string',
        description: 'Nombre completo del encargado en texto plano',
        example: 'Carlos Vargas',
        maxLength: 101,
      },
      { $ref: getSchemaPath(UpdateSucursalEncargadoDto) },
    ],
  })
  @IsOptional()
  @Transform(({ value }) => toEncargadoInput(value))
  @IsEncargadoInput()
  readonly encargado?: string | UpdateSucursalEncargadoDto;
}
