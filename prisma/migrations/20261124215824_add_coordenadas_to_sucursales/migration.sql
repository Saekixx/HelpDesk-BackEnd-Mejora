-- AlterTable
ALTER TABLE `citas_soporte` MODIFY `hora_fin` TIME(0) NULL;

-- AlterTable
ALTER TABLE `sucursales` ADD COLUMN `latitud` DECIMAL(10, 8) NULL,
    ADD COLUMN `longitud` DECIMAL(11, 8) NULL;
