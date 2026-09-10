import { GetRolesUseCase } from '@/usuarios/application/use-cases/get-roles.use-case';
import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Roles')
@Controller('role')
export class RolesController {
  constructor(private readonly getRolesUseCase: GetRolesUseCase) {}

  @Get('options')
  async findAll() {
    const data = await this.getRolesUseCase.execute();
    return {
      message: 'Roles obtenidos exitosamente',
      data,
    };
  }
}
