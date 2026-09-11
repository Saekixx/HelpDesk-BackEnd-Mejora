import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import { UpdatePlanDto } from '@/planes/application/dtos/update-plan.dto';

export class UpdatePlanRequestDto implements UpdatePlanDto {
  @ApiPropertyOptional({
    description: 'Número identificador o código secuencial del plan',
    example: 101,
    minimum: 1,
  })
  @IsOptional()
  @IsInt({ message: 'El número de plan debe ser un número entero' })
  @IsPositive({ message: 'El número de plan debe ser un valor positivo' })
  numero_plan: number;

  @ApiPropertyOptional({
    description: 'Tipo o categoría del plan',
    example: 'Empresarial Premium',
  })
  @IsOptional()
  @IsString({ message: 'El tipo debe ser una cadena de texto' })
  tipo: string;

  @ApiPropertyOptional({
    description: 'Lista de servicios o cobertura incluidos en el plan',
    example: ['Mantenimiento preventivo', 'Soporte 24/7', 'Backups semanales'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Los servicios deben enviarse en una lista/arreglo' })
  @IsString({
    each: true,
    message: 'Cada servicio debe ser una cadena de texto',
  })
  servicios: string[];

  @ApiPropertyOptional({
    description: 'Costo mensual o tarifa del plan',
    example: 299.9,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El precio debe ser un número válido (máximo 2 decimales)' },
  )
  @Min(0, { message: 'El precio no puede ser negativo' })
  precio: number;

  @ApiPropertyOptional({
    description:
      'Límite máximo de equipos o dispositivos cubiertos por el plan',
    example: 20,
    minimum: 1,
  })
  @IsOptional()
  @IsInt({ message: 'El límite de equipos debe ser un número entero' })
  @Min(1, { message: 'El límite de equipos debe ser de al menos 1' })
  limite_equipos: number;
}
