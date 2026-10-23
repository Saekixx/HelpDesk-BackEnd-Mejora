/*
  Warnings:

  - You are about to drop the column `marca` on the `equipos` table. All the data in the column will be lost.
  - You are about to drop the column `nombre_usuario` on the `equipos` table. All the data in the column will be lost.
  - You are about to drop the column `descripcion` on the `hardware` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `hardware` table. All the data in the column will be lost.
  - You are about to drop the column `marca` on the `hardware` table. All the data in the column will be lost.
  - You are about to drop the column `rev_programada` on the `hardware` table. All the data in the column will be lost.
  - You are about to drop the column `tipo_equipo` on the `hardware` table. All the data in the column will be lost.
  - You are about to drop the column `ult_revision` on the `hardware` table. All the data in the column will be lost.
  - You are about to drop the column `descripcion` on the `registro_hardware` table. All the data in the column will be lost.
  - You are about to drop the column `proveedor` on the `registro_hardware` table. All the data in the column will be lost.
  - You are about to drop the column `serie` on the `registro_hardware` table. All the data in the column will be lost.
  - You are about to drop the column `correo` on the `software` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_instalacion` on the `software` table. All the data in the column will be lost.
  - You are about to drop the column `licencia` on the `software` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `software` table. All the data in the column will be lost.
  - You are about to drop the column `licencia_asignada` on the `software_equipos` table. All the data in the column will be lost.
  - Added the required column `marca_modelo` to the `hardware` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipo_componente` to the `hardware` table without a default value. This is not possible if the table is not empty.
  - Made the column `id_hardware` on table `registro_hardware` required. This step will fail if there are existing NULL values in that column.
  - Made the column `id_equipo` on table `registro_hardware` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `equipos` DROP FOREIGN KEY `fk_equipos_sucursal`;

-- DropForeignKey
ALTER TABLE `registro_hardware` DROP FOREIGN KEY `fk_rh_equipo`;

-- DropForeignKey
ALTER TABLE `registro_hardware` DROP FOREIGN KEY `fk_rh_hardware`;

-- AlterTable
ALTER TABLE `equipos` DROP COLUMN `marca`,
    DROP COLUMN `nombre_usuario`,
    ADD COLUMN `estado` ENUM('Activo', 'En Almacén', 'En Mantenimiento', 'Retirado') NULL DEFAULT 'Activo',
    ADD COLUMN `marca_modelo` VARCHAR(150) NULL;

-- AlterTable
ALTER TABLE `hardware` DROP COLUMN `descripcion`,
    DROP COLUMN `is_active`,
    DROP COLUMN `marca`,
    DROP COLUMN `rev_programada`,
    DROP COLUMN `tipo_equipo`,
    DROP COLUMN `ult_revision`,
    ADD COLUMN `estado` ENUM('Instalado', 'En Stock', 'En Mantenimiento', 'De Baja') NULL DEFAULT 'En Stock',
    ADD COLUMN `id_equipo_actual` INTEGER NULL,
    ADD COLUMN `marca_modelo` VARCHAR(150) NOT NULL,
    ADD COLUMN `tipo_componente` VARCHAR(100) NOT NULL,
    MODIFY `fecha_compra` DATE NULL,
    MODIFY `proveedor` VARCHAR(150) NULL;

-- AlterTable
ALTER TABLE `registro_hardware` DROP COLUMN `descripcion`,
    DROP COLUMN `proveedor`,
    DROP COLUMN `serie`,
    ADD COLUMN `fecha_retiro` DATETIME(0) NULL,
    ADD COLUMN `id_tecnico_resp` INTEGER NULL,
    ADD COLUMN `motivo_retiro` TEXT NULL,
    ADD COLUMN `salud_smart` VARCHAR(100) NULL,
    MODIFY `id_hardware` INTEGER NOT NULL,
    MODIFY `id_equipo` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `software` DROP COLUMN `correo`,
    DROP COLUMN `fecha_instalacion`,
    DROP COLUMN `licencia`,
    DROP COLUMN `password`,
    ADD COLUMN `categoria` VARCHAR(100) NULL,
    ADD COLUMN `fecha_compra` DATE NULL,
    ADD COLUMN `licencia_master_key` VARCHAR(150) NULL,
    ADD COLUMN `licencias_usadas` INTEGER NULL DEFAULT 0,
    ADD COLUMN `limite_equipos` INTEGER NULL DEFAULT 1,
    ADD COLUMN `tipo_licencia` ENUM('Monousuario / OEM', 'Pool Limitado', 'Corporativa Flotante', 'Empresarial Ilimitada') NOT NULL DEFAULT 'Pool Limitado',
    ADD COLUMN `url_factura` VARCHAR(255) NULL,
    MODIFY `nombre_software` VARCHAR(150) NOT NULL,
    MODIFY `fecha_caducidad` DATE NULL,
    MODIFY `proveedor` VARCHAR(150) NULL;

-- AlterTable
ALTER TABLE `software_equipos` DROP COLUMN `licencia_asignada`,
    ADD COLUMN `correo_asociado` VARCHAR(150) NULL,
    ADD COLUMN `fecha_vencimiento` DATE NULL,
    ADD COLUMN `licencia_especifica` VARCHAR(150) NULL,
    ADD COLUMN `password_enc` VARCHAR(255) NULL;

-- CreateIndex
CREATE INDEX `fk_hw_equipo_actual` ON `hardware`(`id_equipo_actual`);

-- CreateIndex
CREATE INDEX `fk_rh_tecnico` ON `registro_hardware`(`id_tecnico_resp`);

-- AddForeignKey
ALTER TABLE `equipos` ADD CONSTRAINT `fk_equipos_sucursal` FOREIGN KEY (`id_sucursal`) REFERENCES `sucursales`(`id_sucursal`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `hardware` ADD CONSTRAINT `fk_hw_equipo_actual` FOREIGN KEY (`id_equipo_actual`) REFERENCES `equipos`(`id_equipo`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `registro_hardware` ADD CONSTRAINT `fk_rh_equipo` FOREIGN KEY (`id_equipo`) REFERENCES `equipos`(`id_equipo`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `registro_hardware` ADD CONSTRAINT `fk_rh_hardware` FOREIGN KEY (`id_hardware`) REFERENCES `hardware`(`id_hardware`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `registro_hardware` ADD CONSTRAINT `fk_rh_tecnico` FOREIGN KEY (`id_tecnico_resp`) REFERENCES `usuarios`(`id_usuario`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- RedefineIndex
CREATE INDEX `fk_software` ON `software_equipos`(`id_software`);
DROP INDEX `fk_se_software` ON `software_equipos`;
