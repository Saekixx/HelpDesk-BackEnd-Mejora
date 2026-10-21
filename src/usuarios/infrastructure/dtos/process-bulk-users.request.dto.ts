import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { MAX_BULK_ROWS } from '@/usuarios/domain/criteria/bulk-user-row.criteria';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class BulkUserItemRequestDto {
  @ApiPropertyOptional({
    description: 'Fila original del archivo (para identificar el resultado)',
    example: 2,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  fila?: number;

  @ApiProperty({ example: 'Ana' })
  @Transform(trim)
  @IsString()
  nombre: string;

  @ApiProperty({ example: 'Torres' })
  @Transform(trim)
  @IsString()
  apellido: string;

  @ApiProperty({ example: 'ana.torres@empresa.com' })
  @Transform(trim)
  @IsString()
  correo: string;

  @ApiProperty({ example: 'CLIENTE_TRABAJADOR' })
  @Transform(trim)
  @IsString()
  rol: string;

  @ApiPropertyOptional({ example: 'Sede Lima' })
  @IsOptional()
  @Transform(trim)
  @IsString()
  sucursal?: string;

  @ApiPropertyOptional({ example: 'Sistemas' })
  @IsOptional()
  @Transform(trim)
  @IsString()
  area?: string;
}

export class ProcessBulkUsersRequestDto {
  @ApiProperty({
    description: 'ID de la empresa (cliente) destino de la carga masiva',
    example: 1,
  })
  @Type(() => Number)
  @IsInt({ message: 'id_cliente debe ser un número entero' })
  @Min(1, { message: 'id_cliente debe ser mayor a 0' })
  id_cliente: number;

  @ApiProperty({
    description:
      'Si es true, se envía a cada usuario creado un correo para que defina su contraseña',
    example: true,
  })
  @IsBoolean({ message: 'enviarCredenciales debe ser true o false' })
  enviarCredenciales: boolean;

  @ApiProperty({
    description: 'Usuarios aprobados en la pre-validación',
    type: [BulkUserItemRequestDto],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'Debes enviar al menos un usuario' })
  @ArrayMaxSize(MAX_BULK_ROWS, {
    message: `No puedes enviar más de ${MAX_BULK_ROWS} usuarios por carga`,
  })
  @ValidateNested({ each: true })
  @Type(() => BulkUserItemRequestDto)
  usuarios: BulkUserItemRequestDto[];
}
