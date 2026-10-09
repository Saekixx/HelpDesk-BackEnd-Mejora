/*
  Warnings:

  - You are about to drop the column `id_soporte` on the `citas_soporte` table. All the data in the column will be lost.
  - You are about to drop the `citas_tickets` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `hora_fin` to the `citas_soporte` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hora_inicio` to the `citas_soporte` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_tecnico` to the `citas_soporte` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_ticket` to the `citas_soporte` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `citas_soporte` DROP FOREIGN KEY `fk_cita_soporte`;

-- DropForeignKey
ALTER TABLE `citas_tickets` DROP FOREIGN KEY `fk_citastickets_cita`;

-- DropForeignKey
ALTER TABLE `citas_tickets` DROP FOREIGN KEY `fk_citastickets_ticket`;

-- AlterTable
ALTER TABLE `citas_soporte` DROP COLUMN `id_soporte`,
    ADD COLUMN `hora_fin` TIME(0) NOT NULL,
    ADD COLUMN `hora_inicio` TIME(0) NOT NULL,
    ADD COLUMN `id_tecnico` INTEGER NOT NULL,
    ADD COLUMN `id_ticket` INTEGER NOT NULL,
    MODIFY `fecha_programada` DATE NOT NULL;

-- AlterTable
ALTER TABLE `sucursales` ADD COLUMN `id_zona` INTEGER NULL;

-- AlterTable
ALTER TABLE `tickets` MODIFY `estado` ENUM('Pendiente', 'Asignado', 'En Progreso', 'Derivado InSitu', 'Reabierto', 'Cerrado') NULL DEFAULT 'Pendiente';

-- DropTable
DROP TABLE `citas_tickets`;

-- CreateTable
CREATE TABLE `zonas` (
    `id_zona` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre_zona` VARCHAR(100) NOT NULL,
    `descripcion` TEXT NULL,
    `is_active` BOOLEAN NULL DEFAULT true,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id_zona`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tecnicos_zonas` (
    `id_tecnico` INTEGER NOT NULL,
    `id_zona` INTEGER NOT NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_tz_zona`(`id_zona`),
    PRIMARY KEY (`id_tecnico`, `id_zona`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `soft_locks` (
    `id_lock` INTEGER NOT NULL AUTO_INCREMENT,
    `id_tecnico` INTEGER NOT NULL,
    `fecha` DATE NOT NULL,
    `franja` VARCHAR(50) NOT NULL,
    `lock_token` VARCHAR(255) NOT NULL,
    `expires_at` DATETIME(0) NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_sl_tecnico`(`id_tecnico`),
    PRIMARY KEY (`id_lock`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `auditoria_eventos` (
    `id_auditoria` INTEGER NOT NULL AUTO_INCREMENT,
    `id_ticket` INTEGER NULL,
    `id_cita` INTEGER NULL,
    `id_usuario` INTEGER NULL,
    `tipo_evento` VARCHAR(100) NOT NULL,
    `payload` JSON NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_audit_ticket`(`id_ticket`),
    INDEX `fk_audit_cita`(`id_cita`),
    INDEX `fk_audit_usuario`(`id_usuario`),
    PRIMARY KEY (`id_auditoria`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `fk_cita_ticket` ON `citas_soporte`(`id_ticket`);

-- CreateIndex
CREATE INDEX `fk_cita_tecnico` ON `citas_soporte`(`id_tecnico`);

-- CreateIndex
CREATE INDEX `fk_sucursal_zona` ON `sucursales`(`id_zona`);

-- AddForeignKey
ALTER TABLE `sucursales` ADD CONSTRAINT `fk_sucursal_zona` FOREIGN KEY (`id_zona`) REFERENCES `zonas`(`id_zona`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tecnicos_zonas` ADD CONSTRAINT `fk_tz_tecnico` FOREIGN KEY (`id_tecnico`) REFERENCES `usuarios`(`id_usuario`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tecnicos_zonas` ADD CONSTRAINT `fk_tz_zona` FOREIGN KEY (`id_zona`) REFERENCES `zonas`(`id_zona`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `citas_soporte` ADD CONSTRAINT `fk_cita_ticket` FOREIGN KEY (`id_ticket`) REFERENCES `tickets`(`id_tickets`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `citas_soporte` ADD CONSTRAINT `fk_cita_tecnico` FOREIGN KEY (`id_tecnico`) REFERENCES `usuarios`(`id_usuario`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `soft_locks` ADD CONSTRAINT `fk_sl_tecnico` FOREIGN KEY (`id_tecnico`) REFERENCES `usuarios`(`id_usuario`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `auditoria_eventos` ADD CONSTRAINT `fk_audit_ticket` FOREIGN KEY (`id_ticket`) REFERENCES `tickets`(`id_tickets`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `auditoria_eventos` ADD CONSTRAINT `fk_audit_cita` FOREIGN KEY (`id_cita`) REFERENCES `citas_soporte`(`id_cita`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `auditoria_eventos` ADD CONSTRAINT `fk_audit_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id_usuario`) ON DELETE SET NULL ON UPDATE RESTRICT;
