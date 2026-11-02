/*
  Warnings:

  - Made the column `estado` on table `hardware` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `hardware` MODIFY `estado` ENUM('Instalado', 'Disponible', 'En Mantenimiento', 'Baja / Descarte') NOT NULL DEFAULT 'Disponible';

-- CreateIndex
CREATE INDEX `idx_hw_estado` ON `hardware`(`estado`);
