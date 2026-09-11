import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import { CreatePlanDto } from '@/planes/application/dtos/create-plan.dto';

export class CreatePlanRequestDto implements CreatePlanDto {
  @ApiProperty({
    description: 'Número identificador o código secuencial del plan',
    example: 101,
    minimum: 1,
  })
  @IsInt({ message: 'El número de plan debe ser un número entero' })
  @IsPositive({ message: 'El número de plan debe ser un valor positivo' })
  @IsNotEmpty({ message: 'El número de plan es obligatorio' })
  numero_plan: number;

  @ApiProperty({
    description: 'Tipo o categoría del plan',
    example: 'Empresarial',
  })
  @IsString({ message: 'El tipo debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El tipo de plan es obligatorio' })
  tipo: string;

  @ApiProperty({
    description: 'Lista de servicios o cobertura incluidos en el plan',
    example: ['Mantenimiento preventivo', 'Soporte 24/7', 'Backups mensuales'],
    type: [String],
  })
  @IsArray({ message: 'Los servicios deben enviarse en una lista/arreglo' })
  @IsString({
    each: true,
    message: 'Cada servicio debe ser una cadena de texto',
  })
  @IsNotEmpty({ message: 'Debe especificar al menos un servicio' })
  servicio: string[];

  @ApiProperty({
    description: 'Costo mensual o tarifa del plan',
    example: 250.5,
    minimum: 0,
  })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El precio debe ser un número válido (máximo 2 decimales)' },
  )
  @Min(0, { message: 'El precio no puede ser negativo' })
  @IsNotEmpty({ message: 'El precio es obligatorio' })
  precio: number;

  @ApiProperty({
    description:
      'Límite máximo de equipos o dispositivos cubiertos por el plan',
    example: 15,
    minimum: 1,
  })
  @IsInt({ message: 'El límite de equipos debe ser un número entero' })
  @Min(1, { message: 'El límite de equipos debe ser de al menos 1' })
  @IsNotEmpty({ message: 'El límite de equipos es obligatorio' })
  limite_equipos: number;
}
