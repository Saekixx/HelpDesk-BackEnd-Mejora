-- AlterTable
ALTER TABLE `registro_hardware` ADD COLUMN `is_active` BOOLEAN NULL DEFAULT true,
    ADD COLUMN `marca` VARCHAR(50) NULL,
    ADD COLUMN `tipo` VARCHAR(50) NULL,
    ADD COLUMN `url_factura` VARCHAR(255) NULL;
