import { EncryptMasterKeyUtil } from '@/common/utils/encrypt-master-key.util';
import { Software } from '@/software/domain/entities/software.entity';
import {
  SOFTWARE_REPOSITORY,
  SoftwareRepositoryPort,
} from '@/software/domain/ports/software.repository.port';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindByIdSoftwareUseCase {
  constructor(
    @Inject(SOFTWARE_REPOSITORY)
    private readonly softwareRepository: SoftwareRepositoryPort,
  ) {}

  async execute(id: number): Promise<Software | null> {
    const software = await this.softwareRepository.findById(id);
    const encryptMasterKeyUtil = new EncryptMasterKeyUtil();

    if (software && software.licencia_master_key) {
      const decryptedKey = encryptMasterKeyUtil.decryptMasterKey(
        software.licencia_master_key,
      );

      // Creamos un nuevo objeto plano reasignando la propiedad de forma segura para evitar restricciones de solo lectura
      return {
        ...software,
        licencia_master_key: decryptedKey,
      } as Software;
    }

    return software;
  }
}
