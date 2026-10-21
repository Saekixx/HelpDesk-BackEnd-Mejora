import { Inject, Injectable } from '@nestjs/common';
import {
  BULK_USER_FILE_PORT,
  BulkUserFilePort,
} from '@/usuarios/domain/ports/bulk-user-file.port';
import {
  BulkUserEstado,
  BulkUserFileFormat,
  BulkUserRow,
  MAX_BULK_ROWS,
} from '@/usuarios/domain/criteria/bulk-user-row.criteria';
import { InvalidBulkFileException } from '@/usuarios/domain/exceptions/user.exceptions';
import { BulkUserRowValidator } from '../services/bulk-user-row-validator.service';
import { ValidateBulkUsersDto } from '../dtos/validate-bulk-users.dto';
import {
  BulkUserRowResultDto,
  BulkUserStatus,
  BulkUserValidationResultDto,
} from '../dtos/bulk-user-validation-result.dto';

const OBSERVACION_VALIDO = 'Registro válido';

@Injectable()
export class ValidateBulkUsersUseCase {
  constructor(
    @Inject(BULK_USER_FILE_PORT)
    private readonly bulkUserFile: BulkUserFilePort,
    private readonly rowValidator: BulkUserRowValidator,
  ) {}

  async execute(
    dto: ValidateBulkUsersDto,
  ): Promise<BulkUserValidationResultDto> {
    const rows = await this.readRows(dto);

    const context = await this.rowValidator.buildContext(dto.idCliente, rows);
    const validations = this.rowValidator.validateRows(rows, context);

    const detalles: BulkUserRowResultDto[] = validations.map(
      ({ row, errores, is_active }) => ({
        fila: row.fila,
        estado: errores.length ? BulkUserStatus.ERROR : BulkUserStatus.VALIDO,
        observacion: errores.length ? errores.join('; ') : OBSERVACION_VALIDO,
        nombreCompleto: `${row.nombre} ${row.apellido}`.trim(),
        correo: row.correo,
        rol: row.rol,
        empresa: row.empresa,
        sucursal: row.sucursal,
        estadoUsuario: is_active
          ? BulkUserEstado.ACTIVO
          : BulkUserEstado.INACTIVO,
      }),
    );

    const conError = detalles.filter(
      (d) => d.estado === BulkUserStatus.ERROR,
    ).length;

    return {
      totalRegistros: detalles.length,
      validos: detalles.length - conError,
      conError,
      detalles,
    };
  }

  private async readRows({
    file,
  }: ValidateBulkUsersDto): Promise<BulkUserRow[]> {
    if (!file?.buffer?.length) {
      throw new InvalidBulkFileException(
        'debes adjuntar un archivo .xlsx o .csv con datos',
      );
    }

    const rows = await this.bulkUserFile.parseRows(
      file.buffer,
      this.detectFormat(file.originalname),
    );

    if (rows.length === 0) {
      throw new InvalidBulkFileException(
        'el archivo no contiene filas con datos',
      );
    }
    if (rows.length > MAX_BULK_ROWS) {
      throw new InvalidBulkFileException(
        `el archivo supera el máximo de ${MAX_BULK_ROWS} filas`,
      );
    }
    return rows;
  }

  private detectFormat(filename: string): BulkUserFileFormat {
    const extension = filename.split('.').pop()?.toLowerCase();
    if (extension === 'xlsx' || extension === 'csv') return extension;
    throw new InvalidBulkFileException('solo se admiten archivos .xlsx o .csv');
  }
}
