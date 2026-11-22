import { EncryptMasterKeyUtil } from '@/common/utils/encrypt-master-key.util';
import { SoftwareVaultResponseDto } from '@/software/domain/dtos/get-software-equipos.dto';
import {
  SOFTWARE_REPOSITORY,
  SoftwareRepositoryPort,
} from '@/software/domain/ports/software.repository.port';
import { Inject, Injectable } from '@nestjs/common';

/**
 * Caso de uso para obtener el detalle de un software junto con los equipos asociados.
 * Este caso de uso interactúa con el repositorio de software para recuperar la información necesaria.
 */

@Injectable()
export class FindByIdSoftwareEquipoUseCase {
  constructor(
    @Inject(SOFTWARE_REPOSITORY)
    private readonly softwareRepository: SoftwareRepositoryPort,
  ) {}

  async execute(id: number): Promise<SoftwareVaultResponseDto> {
    // Crear una instancia de EncryptMasterKeyUtil para manejar el cifrado y descifrado de la master key
    const encryptMasterKeyUtil = new EncryptMasterKeyUtil();

    // Obtener el software por su ID
    const software = await this.softwareRepository.findSoftwareVaultById(id);

    // Si el software tiene una master key, descifrarla
    if (software && software.licencia_master_key) {
      const decryptedKey = encryptMasterKeyUtil.decryptMasterKey(
        software.licencia_master_key,
      );
      // Crear un nuevo objeto plano reasignando la propiedad de forma segura para evitar restricciones de solo lectura
      return {
        ...software,
        licencia_master_key: decryptedKey,
      } as SoftwareVaultResponseDto;
    }
    return software as SoftwareVaultResponseDto;
  }
}
