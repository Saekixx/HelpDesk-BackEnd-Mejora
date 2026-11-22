-- AlterTable
ALTER TABLE `software` ADD COLUMN `id_cliente` INTEGER NULL,
    ADD COLUMN `id_sucursal` INTEGER NULL;

-- CreateIndex
CREATE INDEX `fk_software_cliente` ON `software`(`id_cliente`);

-- CreateIndex
CREATE INDEX `fk_software_sucursal` ON `software`(`id_sucursal`);

-- AddForeignKey
ALTER TABLE `software` ADD CONSTRAINT `fk_software_cliente` FOREIGN KEY (`id_cliente`) REFERENCES `clientes`(`id_cliente`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `software` ADD CONSTRAINT `fk_software_sucursal` FOREIGN KEY (`id_sucursal`) REFERENCES `sucursales`(`id_sucursal`) ON DELETE CASCADE ON UPDATE RESTRICT;
