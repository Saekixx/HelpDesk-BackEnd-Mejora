/*
  Warnings:

  - You are about to alter the column `tipo_componente` on the `hardware` table. The data in that column could be lost. The data in that column will be cast from `VarChar(100)` to `Enum(EnumId(2))`.

*/
-- AlterTable
ALTER TABLE `hardware` ADD COLUMN `costo_unitario` DECIMAL(10, 2) NULL DEFAULT 0.00,
    MODIFY `tipo_componente` ENUM('Memoria RAM', 'Almacenamiento SSD/NVMe', 'Almacenamiento HDD', 'Fuente de Poder (PSU)', 'Procesador (CPU)', 'Tarjeta Gráfica (GPU)', 'Placa Base') NOT NULL;
