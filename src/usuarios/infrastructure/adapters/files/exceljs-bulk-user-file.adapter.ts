import { Injectable } from '@nestjs/common';
import { Readable } from 'node:stream';
import { Workbook, Worksheet } from 'exceljs';
import { RolEnum } from '@/auth/domain/enums/rol.enum';
import { BulkUserFilePort } from '@/usuarios/domain/ports/bulk-user-file.port';
import {
  BULK_USER_COLUMNS,
  BULK_USER_ESTADO_POR_DEFECTO,
  BULK_USER_OPTIONAL_COLUMNS,
  BulkUserColumn,
  BulkUserEstado,
  BulkUserFileFormat,
  BulkUserRow,
} from '@/usuarios/domain/criteria/bulk-user-row.criteria';
import { InvalidBulkFileException } from '@/usuarios/domain/exceptions/user.exceptions';

const MAX_TEMPLATE_ROWS = 1000;

const COLUMN_GUIDE: Record<BulkUserColumn, [string, string]> = {
  nombre: ['Sí', 'Nombre del usuario.'],
  apellido: ['Sí', 'Apellido del usuario.'],
  correo: ['Sí', 'Correo electrónico único; no debe estar registrado.'],
  rol: ['Sí', `Uno de: ${Object.values(RolEnum).join(', ')}.`],
  empresa: [
    'No',
    'Nombre de la empresa. Si se indica, debe coincidir con la empresa seleccionada para la carga.',
  ],
  sucursal: ['No', 'Nombre exacto de la sucursal registrada.'],
  area: ['No', 'Nombre exacto del área registrada.'],
  estado: [
    'No',
    `Uno de: ${Object.values(BulkUserEstado).join(', ')}. Si se deja vacío se asume ${BULK_USER_ESTADO_POR_DEFECTO}.`,
  ],
};

@Injectable()
export class ExcelJsBulkUserFileAdapter implements BulkUserFilePort {
  async generateTemplate(): Promise<Buffer> {
    const workbook = new Workbook();
    const sheet = workbook.addWorksheet('Usuarios');

    sheet.columns = BULK_USER_COLUMNS.map((key) => ({
      header: key,
      key,
      width: 26,
    }));
    sheet.getRow(1).font = { bold: true };
    sheet.views = [{ state: 'frozen', ySplit: 1 }];

    // Listas desplegables: "rol" (roles válidos) y "estado" (ACTIVO / INACTIVO)
    const rolColumn = BULK_USER_COLUMNS.indexOf('rol') + 1;
    const estadoColumn = BULK_USER_COLUMNS.indexOf('estado') + 1;
    for (let row = 2; row <= MAX_TEMPLATE_ROWS + 1; row++) {
      sheet.getCell(row, rolColumn).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [`"${Object.values(RolEnum).join(',')}"`],
        showErrorMessage: true,
        errorTitle: 'Rol inválido',
        error: 'Selecciona un rol de la lista.',
      };
      sheet.getCell(row, estadoColumn).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [`"${Object.values(BulkUserEstado).join(',')}"`],
        showErrorMessage: true,
        errorTitle: 'Estado inválido',
        error: 'Selecciona ACTIVO o INACTIVO.',
      };
    }

    const guide = workbook.addWorksheet('Instrucciones');
    guide.columns = [
      { header: 'Columna', key: 'columna', width: 14 },
      { header: 'Obligatoria', key: 'obligatoria', width: 14 },
      { header: 'Descripción', key: 'descripcion', width: 90 },
    ];
    guide.getRow(1).font = { bold: true };
    for (const column of BULK_USER_COLUMNS) {
      const [obligatoria, descripcion] = COLUMN_GUIDE[column];
      guide.addRow({ columna: column, obligatoria, descripcion });
    }

    return Buffer.from(await workbook.xlsx.writeBuffer());
  }

  async parseRows(
    file: Buffer,
    format: BulkUserFileFormat,
  ): Promise<BulkUserRow[]> {
    try {
      const sheet =
        format === 'csv' ? await this.readCsv(file) : await this.readXlsx(file);
      return this.extractRows(sheet);
    } catch (error) {
      if (error instanceof InvalidBulkFileException) throw error;
      throw new InvalidBulkFileException('no se pudo leer el archivo');
    }
  }

  private async readXlsx(file: Buffer): Promise<Worksheet> {
    const workbook = new Workbook();
    await workbook.xlsx.load(
      file as unknown as Parameters<typeof workbook.xlsx.load>[0],
    );
    const sheet = workbook.worksheets[0];
    if (!sheet) throw new InvalidBulkFileException('el libro no tiene hojas');
    return sheet;
  }

  private async readCsv(file: Buffer): Promise<Worksheet> {
    const text = file.toString('utf8').replace(/^\uFEFF/, '');
    // Excel en español exporta CSV separado por ";"
    const delimiter = text.split(/\r?\n/, 1)[0].includes(';') ? ';' : ',';
    return new Workbook().csv.read(Readable.from(text), {
      parserOptions: { delimiter },
    });
  }

  private extractRows(sheet: Worksheet): BulkUserRow[] {
    const columnIndex = new Map<BulkUserColumn, number>();
    sheet.getRow(1).eachCell((cell, index) => {
      const name = cell.text.trim().toLowerCase() as BulkUserColumn;
      if (BULK_USER_COLUMNS.includes(name)) columnIndex.set(name, index);
    });

    // "empresa" y "estado" son opcionales: así siguen siendo válidas las plantillas anteriores
    const missing = BULK_USER_COLUMNS.filter(
      (c) => !columnIndex.has(c) && !BULK_USER_OPTIONAL_COLUMNS.includes(c),
    );
    if (missing.length) {
      throw new InvalidBulkFileException(
        `faltan las columnas: ${missing.join(', ')}`,
      );
    }

    const rows: BulkUserRow[] = [];
    sheet.eachRow((row, fila) => {
      if (fila === 1) return;
      const values = Object.fromEntries(
        BULK_USER_COLUMNS.map((c) => {
          const index = columnIndex.get(c);
          return [c, index === undefined ? '' : row.getCell(index).text.trim()];
        }),
      ) as Record<BulkUserColumn, string>;
      if (Object.values(values).some(Boolean)) rows.push({ fila, ...values });
    });
    return rows;
  }
}
