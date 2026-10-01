/*
  Warnings:

  - You are about to drop the column `is_active` on the `registro_hardware` table. All the data in the column will be lost.
  - You are about to drop the column `marca` on the `registro_hardware` table. All the data in the column will be lost.
  - You are about to drop the column `tipo` on the `registro_hardware` table. All the data in the column will be lost.
  - You are about to drop the column `url_factura` on the `registro_hardware` table. All the data in the column will be lost.
  - You are about to drop the column `id_cliente` on the `tickets` table. All the data in the column will be lost.
  - You are about to drop the column `id_software` on the `tickets` table. All the data in the column will be lost.
  - You are about to drop the column `imagen_url` on the `tickets` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `tickets` DROP FOREIGN KEY `fk_tickets_clientes`;

-- DropForeignKey
ALTER TABLE `tickets` DROP FOREIGN KEY `fk_tickets_software`;

-- AlterTable
ALTER TABLE `hardware` ADD COLUMN `url_factura` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `registro_hardware` DROP COLUMN `is_active`,
    DROP COLUMN `marca`,
    DROP COLUMN `tipo`,
    DROP COLUMN `url_factura`,
    ADD COLUMN `is_actual` BOOLEAN NULL DEFAULT true;

-- AlterTable
ALTER TABLE `tickets` DROP COLUMN `id_cliente`,
    DROP COLUMN `id_software`,
    DROP COLUMN `imagen_url`;
