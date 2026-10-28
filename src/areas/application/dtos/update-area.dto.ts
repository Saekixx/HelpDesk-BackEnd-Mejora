import { PartialType } from '@nestjs/swagger'; // <--- Cambiado a @nestjs/swagger
import { CreateAreaDto } from './create-area.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAreaDto extends PartialType(CreateAreaDto) {
  @ApiPropertyOptional({
    description: 'Estado activo o inactivo del área',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'El estado is_active debe ser un valor booleano' })
  is_active?: boolean;
}