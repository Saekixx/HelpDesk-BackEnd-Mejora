-- AlterTable
ALTER TABLE `citas_soporte` MODIFY `hora_fin` TIME(0) NULL;

-- AlterTable
ALTER TABLE `registro_hardware` ADD COLUMN `motivo_instalacion` TEXT NULL;
