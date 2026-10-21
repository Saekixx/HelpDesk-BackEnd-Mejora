import {
  BULK_USER_FILE_PORT,
  BulkUserFilePort,
} from '@/usuarios/domain/ports/bulk-user-file.port';
import { Inject, Injectable } from '@nestjs/common';
import { BulkUserTemplateDto } from '../dtos/bulk-user-template.dto';

const TEMPLATE_FILENAME = 'plantilla-carga-masiva-usuarios.xlsx';
const XLSX_MIME_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

@Injectable()
export class GetBulkUserTemplateUseCase {
  constructor(
    @Inject(BULK_USER_FILE_PORT)
    private readonly bulkUserFile: BulkUserFilePort,
  ) {}

  async execute(): Promise<BulkUserTemplateDto> {
    return {
      buffer: await this.bulkUserFile.generateTemplate(),
      filename: TEMPLATE_FILENAME,
      mimeType: XLSX_MIME_TYPE,
    };
  }
}
