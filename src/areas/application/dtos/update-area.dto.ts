import { PartialType } from '@nestjs/mapped-types';
import { CreateAreaDto } from './create-area.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateAreaDto extends PartialType(CreateAreaDto) {
  @IsOptional()
  @IsBoolean({ message: 'El estado is_active debe ser un valor booleano' })
  is_active?: boolean;
}