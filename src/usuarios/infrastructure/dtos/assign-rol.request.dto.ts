import { AssignRolDTO } from '@/usuarios/application/dtos/assign-rol.use-case';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class AssignRolRequestDto implements AssignRolDTO {
  @ApiProperty({
    description: 'ID del nuevo rol asignado al usuario',
    example: 2,
  })
  @IsNumber({}, { message: 'El ID de rol debe ser un número entero' })
  @IsNotEmpty({ message: 'El ID de rol es obligatorio' })
  readonly id_rol: number;

  @ApiPropertyOptional({
    description: 'ID del cliente/empresa (requerido según el rol asignado)',
    example: 1,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El ID de cliente debe ser un número entero' })
  readonly id_cliente?: number;

  @ApiPropertyOptional({
    description: 'ID de la sucursal (requerido según el rol asignado)',
    example: 1,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El ID de sucursal debe ser un número entero' })
  readonly id_sucursal?: number;

  @ApiPropertyOptional({
    description: 'ID del área (requerido según el rol asignado)',
    example: 3,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El ID de área debe ser un número entero' })
  readonly id_area?: number;
}
