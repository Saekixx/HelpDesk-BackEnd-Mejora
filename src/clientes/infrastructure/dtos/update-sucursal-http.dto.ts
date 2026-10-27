import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CreateSucursalHttpDto } from './create-sucursal-http.dto';
import { UpdateSucursalDto } from '@/clientes/domain/dto/update-sucursal.dto';

// PartialType hace opcionales los campos heredados de CreateSucursalHttpDto
// conservando sus validadores y su documentación Swagger. El `encargado`
// anidado (con cuenta de usuario) solo aplica al alta, por lo que se omite y
// la actualización conserva los campos planos de contacto de la sucursal.
export class UpdateSucursalHttpDto
  extends PartialType(OmitType(CreateSucursalHttpDto, ['encargado'] as const))
  implements UpdateSucursalDto
{
  @ApiPropertyOptional({
    description: 'Nombre del encargado de la sucursal',
    example: 'Juan Pérez',
  })
  @IsOptional()
  @IsString({ message: 'El encargado debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El encargado no puede estar vacío' })
  readonly encargado?: string;

  @ApiPropertyOptional({
    description: 'Teléfono de contacto de la sucursal',
    example: '+51987654321',
  })
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El teléfono no puede estar vacío' })
  readonly telefono?: string;

  @ApiPropertyOptional({
    description: 'Correo de contacto de la sucursal',
    example: 'sucursal.centro@acme.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'El correo electrónico debe ser válido' })
  readonly correo?: string;
}
