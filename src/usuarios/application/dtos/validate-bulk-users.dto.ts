// Archivo recibido por HTTP, desacoplado del tipo concreto de multer
export interface BulkUploadedFile {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export interface ValidateBulkUsersDto {
  file: BulkUploadedFile | undefined;
  idCliente: number;
}
