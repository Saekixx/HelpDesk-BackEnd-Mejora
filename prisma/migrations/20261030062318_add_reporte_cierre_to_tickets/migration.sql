-- AlterTable
ALTER TABLE `software` ADD COLUMN `estado` ENUM('Activo', 'Suspendido', 'Caducado', 'Inactivo') NULL DEFAULT 'Activo';

-- AlterTable
ALTER TABLE `tickets` ADD COLUMN `reporte_cierre` TEXT NULL,
    MODIFY `estado` ENUM('Pendiente', 'Asignado', 'En Progreso', 'Derivado InSitu', 'En Espera Repuesto', 'Reabierto', 'Cerrado') NULL DEFAULT 'Pendiente';
