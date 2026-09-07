import {
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  Min,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { GetUsersFilterDto } from '../../application/dtos/get-users-filter.dto';

export class GetUsersQueryDto implements GetUsersFilterDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  id_rol?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  id_cliente?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  id_sucursal?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  id_area?: number;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}
