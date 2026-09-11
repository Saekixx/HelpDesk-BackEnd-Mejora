-- CreateTable
CREATE TABLE `area` (
    `id_area` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre_area` VARCHAR(100) NOT NULL,
    `contacto` VARCHAR(100) NOT NULL,
    `telefono` VARCHAR(20) NOT NULL,
    `correo` VARCHAR(100) NOT NULL,
    `id_sucursal` INTEGER NULL,
    `is_active` BOOLEAN NULL DEFAULT true,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_area_sucursal`(`id_sucursal`),
    PRIMARY KEY (`id_area`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `citas_soporte` (
    `id_cita` INTEGER NOT NULL AUTO_INCREMENT,
    `id_soporte` INTEGER NOT NULL,
    `id_sucursal` INTEGER NOT NULL,
    `fecha_programada` DATETIME(0) NOT NULL,
    `estado` ENUM('Pendiente', 'En Camino', 'Completada', 'Cancelada', 'Reprogramada') NULL DEFAULT 'Pendiente',
    `observaciones` TEXT NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_cita_soporte`(`id_soporte`),
    INDEX `fk_cita_sucursal`(`id_sucursal`),
    PRIMARY KEY (`id_cita`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `citas_tickets` (
    `id_cita` INTEGER NOT NULL,
    `id_ticket` INTEGER NOT NULL,

    INDEX `fk_citastickets_ticket`(`id_ticket`),
    PRIMARY KEY (`id_cita`, `id_ticket`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `clientes` (
    `id_cliente` INTEGER NOT NULL AUTO_INCREMENT,
    `tipo_cliente` ENUM('JURIDICA', 'NATURAL') NULL DEFAULT 'JURIDICA',
    `numero_documento` VARCHAR(20) NULL,
    `nombre_principal` VARCHAR(150) NOT NULL,
    `direccion` VARCHAR(200) NULL,
    `telefono` VARCHAR(20) NULL,
    `correo` VARCHAR(100) NULL,
    `rubro` VARCHAR(100) NULL,
    `id_plan` INTEGER NULL,
    `fecha_inicio_plan` DATE NULL,
    `fecha_finalizacion_plan` DATE NULL,
    `costo_negociado` DECIMAL(10, 2) NULL,
    `limite_equipos_contratado` INTEGER NULL,
    `fecha_registro` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `is_active` BOOLEAN NULL DEFAULT true,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `numero_documento`(`numero_documento`),
    INDEX `fk_clientes_plan`(`id_plan`),
    PRIMARY KEY (`id_cliente`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `equipos` (
    `id_equipo` INTEGER NOT NULL AUTO_INCREMENT,
    `tipo` VARCHAR(50) NOT NULL,
    `marca` VARCHAR(50) NOT NULL,
    `num_serie` VARCHAR(100) NULL,
    `nombre_usuario` VARCHAR(100) NULL,
    `ult_revision` DATE NULL,
    `rev_programada` DATE NULL,
    `id_trabajador` INTEGER NULL,
    `id_cliente` INTEGER NULL,
    `id_sucursal` INTEGER NULL,
    `id_area` INTEGER NULL,
    `is_active` BOOLEAN NULL DEFAULT true,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `num_serie`(`num_serie`),
    INDEX `fk_eqipos_trabajador`(`id_trabajador`),
    INDEX `fk_equipos_area`(`id_area`),
    INDEX `fk_equipos_cliente`(`id_cliente`),
    INDEX `fk_equipos_sucursal`(`id_sucursal`),
    PRIMARY KEY (`id_equipo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hardware` (
    `id_hardware` INTEGER NOT NULL AUTO_INCREMENT,
    `tipo_equipo` VARCHAR(100) NOT NULL,
    `numero_serie` VARCHAR(100) NOT NULL,
    `fecha_compra` DATE NOT NULL,
    `marca` VARCHAR(100) NOT NULL,
    `proveedor` VARCHAR(100) NOT NULL,
    `descripcion` TEXT NULL,
    `ult_revision` DATE NULL,
    `rev_programada` DATE NULL,
    `is_active` BOOLEAN NULL DEFAULT true,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id_hardware`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `planes` (
    `id_plan` INTEGER NOT NULL AUTO_INCREMENT,
    `numero_plan` INTEGER NOT NULL,
    `tipo` VARCHAR(100) NOT NULL,
    `servicios` LONGTEXT NOT NULL,
    `precio` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `limite_equipos` INTEGER NULL,
    `is_active` BOOLEAN NULL DEFAULT true,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id_plan`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `registro_hardware` (
    `id_RH` INTEGER NOT NULL AUTO_INCREMENT,
    `fecha_instalacion` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `descripcion` TEXT NOT NULL,
    `serie` VARCHAR(100) NOT NULL,
    `proveedor` VARCHAR(255) NOT NULL,
    `id_hardware` INTEGER NULL,
    `id_equipo` INTEGER NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_rh_equipo`(`id_equipo`),
    INDEX `fk_rh_hardware`(`id_hardware`),
    PRIMARY KEY (`id_RH`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rol` (
    `id_rol` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(50) NOT NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id_rol`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `software` (
    `id_software` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre_software` VARCHAR(100) NOT NULL,
    `licencia` VARCHAR(100) NOT NULL,
    `correo` VARCHAR(100) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `fecha_instalacion` DATE NOT NULL,
    `fecha_caducidad` DATE NOT NULL,
    `proveedor` VARCHAR(100) NOT NULL,
    `is_active` BOOLEAN NULL DEFAULT true,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id_software`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `software_equipos` (
    `id_software_equipos` INTEGER NOT NULL AUTO_INCREMENT,
    `id_software` INTEGER NOT NULL,
    `id_equipo` INTEGER NOT NULL,
    `fecha_instalacion` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `licencia_asignada` VARCHAR(100) NULL,
    `is_active` BOOLEAN NULL DEFAULT true,
    `observaciones` TEXT NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_se_equipos`(`id_equipo`),
    INDEX `fk_se_software`(`id_software`),
    PRIMARY KEY (`id_software_equipos`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sucursales` (
    `id_sucursal` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre_sucursal` VARCHAR(255) NOT NULL,
    `encargado` VARCHAR(255) NOT NULL,
    `telefono` VARCHAR(20) NOT NULL,
    `direccion` VARCHAR(255) NOT NULL,
    `correo` VARCHAR(255) NOT NULL,
    `id_cliente` INTEGER NULL,
    `is_active` BOOLEAN NULL DEFAULT true,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_sucursal_cliente`(`id_cliente`),
    PRIMARY KEY (`id_sucursal`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tickets` (
    `id_tickets` INTEGER NOT NULL AUTO_INCREMENT,
    `pin` VARCHAR(6) NOT NULL,
    `asunto` VARCHAR(255) NOT NULL,
    `detalle` TEXT NOT NULL,
    `estado` ENUM('Pendiente', 'Asignado', 'En Progreso', 'Reabierto', 'Cerrado') NULL DEFAULT 'Pendiente',
    `id_equipo` INTEGER NOT NULL,
    `id_cliente` INTEGER NOT NULL,
    `id_trabajador` INTEGER NOT NULL,
    `id_soporte` INTEGER NULL,
    `id_software` INTEGER NULL,
    `es_software` BOOLEAN NULL DEFAULT false,
    `imagen_url` VARCHAR(255) NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `pin`(`pin`),
    INDEX `fk_tickets_clientes`(`id_cliente`),
    INDEX `fk_tickets_equipo`(`id_equipo`),
    INDEX `fk_tickets_software`(`id_software`),
    INDEX `fk_tickets_soporte`(`id_soporte`),
    INDEX `fk_tickets_trabajador`(`id_trabajador`),
    PRIMARY KEY (`id_tickets`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuarios` (
    `id_usuario` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(50) NOT NULL,
    `apellido` VARCHAR(50) NOT NULL,
    `correo` VARCHAR(255) NULL,
    `password` VARCHAR(255) NOT NULL,
    `telefono` VARCHAR(15) NULL,
    `is_active` BOOLEAN NULL DEFAULT true,
    `id_rol` INTEGER NULL,
    `id_cliente` INTEGER NULL,
    `id_sucursal` INTEGER NULL,
    `id_area` INTEGER NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `correo`(`correo`),
    INDEX `fk_usuario_area`(`id_area`),
    INDEX `fk_usuario_cliente`(`id_cliente`),
    INDEX `fk_usuario_rol`(`id_rol`),
    INDEX `fk_usuario_sucursal`(`id_sucursal`),
    PRIMARY KEY (`id_usuario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `area` ADD CONSTRAINT `fk_area_sucursal` FOREIGN KEY (`id_sucursal`) REFERENCES `sucursales`(`id_sucursal`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `citas_soporte` ADD CONSTRAINT `fk_cita_soporte` FOREIGN KEY (`id_soporte`) REFERENCES `usuarios`(`id_usuario`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `citas_soporte` ADD CONSTRAINT `fk_cita_sucursal` FOREIGN KEY (`id_sucursal`) REFERENCES `sucursales`(`id_sucursal`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `citas_tickets` ADD CONSTRAINT `fk_citastickets_cita` FOREIGN KEY (`id_cita`) REFERENCES `citas_soporte`(`id_cita`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `citas_tickets` ADD CONSTRAINT `fk_citastickets_ticket` FOREIGN KEY (`id_ticket`) REFERENCES `tickets`(`id_tickets`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `clientes` ADD CONSTRAINT `fk_clientes_plan` FOREIGN KEY (`id_plan`) REFERENCES `planes`(`id_plan`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `equipos` ADD CONSTRAINT `fk_eqipos_trabajador` FOREIGN KEY (`id_trabajador`) REFERENCES `usuarios`(`id_usuario`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `equipos` ADD CONSTRAINT `fk_equipos_area` FOREIGN KEY (`id_area`) REFERENCES `area`(`id_area`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `equipos` ADD CONSTRAINT `fk_equipos_cliente` FOREIGN KEY (`id_cliente`) REFERENCES `clientes`(`id_cliente`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `equipos` ADD CONSTRAINT `fk_equipos_sucursal` FOREIGN KEY (`id_sucursal`) REFERENCES `sucursales`(`id_sucursal`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `registro_hardware` ADD CONSTRAINT `fk_rh_equipo` FOREIGN KEY (`id_equipo`) REFERENCES `equipos`(`id_equipo`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `registro_hardware` ADD CONSTRAINT `fk_rh_hardware` FOREIGN KEY (`id_hardware`) REFERENCES `hardware`(`id_hardware`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `software_equipos` ADD CONSTRAINT `fk_se_equipos` FOREIGN KEY (`id_equipo`) REFERENCES `equipos`(`id_equipo`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `software_equipos` ADD CONSTRAINT `fk_se_software` FOREIGN KEY (`id_software`) REFERENCES `software`(`id_software`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `sucursales` ADD CONSTRAINT `fk_sucursal_cliente` FOREIGN KEY (`id_cliente`) REFERENCES `clientes`(`id_cliente`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tickets` ADD CONSTRAINT `fk_tickets_clientes` FOREIGN KEY (`id_cliente`) REFERENCES `clientes`(`id_cliente`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tickets` ADD CONSTRAINT `fk_tickets_equipo` FOREIGN KEY (`id_equipo`) REFERENCES `equipos`(`id_equipo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tickets` ADD CONSTRAINT `fk_tickets_software` FOREIGN KEY (`id_software`) REFERENCES `software`(`id_software`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tickets` ADD CONSTRAINT `fk_tickets_soporte` FOREIGN KEY (`id_soporte`) REFERENCES `usuarios`(`id_usuario`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tickets` ADD CONSTRAINT `fk_tickets_trabajador` FOREIGN KEY (`id_trabajador`) REFERENCES `usuarios`(`id_usuario`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `usuarios` ADD CONSTRAINT `fk_usuario_area` FOREIGN KEY (`id_area`) REFERENCES `area`(`id_area`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `usuarios` ADD CONSTRAINT `fk_usuario_cliente` FOREIGN KEY (`id_cliente`) REFERENCES `clientes`(`id_cliente`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `usuarios` ADD CONSTRAINT `fk_usuario_rol` FOREIGN KEY (`id_rol`) REFERENCES `rol`(`id_rol`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `usuarios` ADD CONSTRAINT `fk_usuario_sucursal` FOREIGN KEY (`id_sucursal`) REFERENCES `sucursales`(`id_sucursal`) ON DELETE SET NULL ON UPDATE RESTRICT;
