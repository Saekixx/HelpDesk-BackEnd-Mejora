USE helpdesk_db;

-- Desactivar comprobación de claves foráneas para permitir el vaciado ordenado
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE auditoria_eventos;
TRUNCATE TABLE soft_locks;
TRUNCATE TABLE citas_soporte;
TRUNCATE TABLE tickets;
TRUNCATE TABLE registro_hardware;
TRUNCATE TABLE software_equipos;
TRUNCATE TABLE hardware;
TRUNCATE TABLE software;
TRUNCATE TABLE equipos;
TRUNCATE TABLE tecnicos_zonas;
TRUNCATE TABLE usuarios;
TRUNCATE TABLE area;
TRUNCATE TABLE sucursales;
TRUNCATE TABLE zonas;
TRUNCATE TABLE clientes;
TRUNCATE TABLE planes;
TRUNCATE TABLE rol;

-- Reactivar comprobación de claves foráneas
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Insertar Roles
INSERT INTO rol (nombre, created_at) VALUES
('ADMINISTRADOR', NOW()),
('SOPORTE_TECNICO', NOW()),
('SOPORTE_INSITU', NOW()),
('CLIENTE_EMPRESA', NOW()),
('CLIENTE_SUCURSAL', NOW()),
('CLIENTE_TRABAJADOR', NOW());

-- 2. Insertar Planes
INSERT INTO planes (numero_plan, tipo, servicios, precio, limite_equipos, is_active, created_at, updated_at) VALUES 
(10, 'Plan de soporte Básico', '["Mantenimiento mensual de equipos", "Asistencia técnica remota", "Informe técnico de equipos"]', 49.99, 20, TRUE, NOW(), NOW()),
(20, 'Plan Premium', '["Mantenimiento quincenal", "Asistencia técnica remota y presencial", "Informe técnico detallado", "Antivirus corporativo"]', 149.99, 100, TRUE, NOW(), NOW()),
(30, 'Tech Enterprise', '["Mantenimiento semanal", "Soporte 24/7", "Asignación de técnico exclusivo", "Monitoreo de red en tiempo real"]', 399.99, 500, TRUE, NOW(), NOW());

-- 3. Insertar Clientes (Asociado al Plan ID 3: Tech Enterprise)
INSERT INTO clientes (tipo_cliente, numero_documento, nombre_principal, direccion, telefono, correo, rubro, id_plan, fecha_inicio_plan, fecha_finalizacion_plan, costo_negociado, limite_equipos_contratado, is_active, created_at, updated_at) VALUES
('JURIDICA', '20555666777', 'Innovación Global Tech', 'Av. Principal 123', '987654321', 'admin@innovaciontech.com', 'Tecnología', 3, '2026-01-01', '2027-01-01', 399.99, 500, TRUE, NOW(), NOW());

-- 4. Insertar Zonas Geográficas
INSERT INTO zonas (nombre_zona, descripcion, is_active, created_at, updated_at) VALUES
('Lima Centro / San Isidro', 'Cubre las sedes financieras y corporativas principales', TRUE, NOW(), NOW()),
('Lima Norte', 'Cubre las sucursales del sector industrial y comercial norte', TRUE, NOW(), NOW());

-- 5. Insertar Sucursales (Pertenecientes al Cliente ID 1 y asociadas a sus Zonas)
INSERT INTO sucursales (nombre_sucursal, encargado, telefono, direccion, correo, id_cliente, id_zona, is_principal, is_active, created_at, updated_at) VALUES
('Sede Central', 'Carlos Mendoza', '01-444-5555', 'Av. Principal 123', 'sede.central@innovaciontech.com', 1, 1, TRUE, TRUE, NOW(), NOW()),
('Sucursal Norte', 'María Vargas', '01-555-6666', 'Av. Norte 456', 'norte@innovaciontech.com', 1, 2, FALSE, TRUE, NOW(), NOW());

-- 6. Insertar Áreas (Asociadas a Sucursal ID 1)
INSERT INTO area (nombre_area, contacto, telefono, correo, id_sucursal, is_active, created_at, updated_at) VALUES
('Sistemas y TI', 'Juan Perez', '01-444-5556', 'sistemas@innovaciontech.com', 1, TRUE, NOW(), NOW()),
('Contabilidad', 'Ana Gomez', '01-444-5557', 'contabilidad@innovaciontech.com', 1, TRUE, NOW(), NOW());

-- 7. Insertar Usuarios
-- ID 1: Administrador
-- ID 2: Soporte Técnico Remoto
-- ID 3: Soporte InSitu (Luis Torres)
-- ID 4: Cliente Empresa (Carlos Mendoza)
-- ID 5: Cliente Sucursal (María Vargas)
-- ID 6: Cliente Trabajador (Jorge Pérez)
INSERT INTO usuarios (nombre, apellido, correo, password, telefono, is_active, id_rol, id_cliente, id_sucursal, id_area, created_at, updated_at) VALUES
('Daniel', 'Singer', 'admin@zaint.com', '$2b$10$L9WqvZ/2MA57qBqdmzp6PuthNnR51zuKAv2vwswCwCH1lDmNe2A5S', '987654321', TRUE, 1, NULL, NULL, NULL, NOW(), NOW()),
('Ana', 'López', 'ana.soporte@zaint.com', '$2b$10$L9WqvZ/2MA57qBqdmzp6PuthNnR51zuKAv2vwswCwCH1lDmNe2A5S', '999888771', TRUE, 2, NULL, NULL, NULL, NOW(), NOW()),
('Luis', 'Torres', 'luis.insitu@zaint.com', '$2b$10$L9WqvZ/2MA57qBqdmzp6PuthNnR51zuKAv2vwswCwCH1lDmNe2A5S', '999888772', TRUE, 3, NULL, NULL, NULL, NOW(), NOW()),
('Carlos', 'Mendoza', 'example@gmail.com', '$2b$10$L9WqvZ/2MA57qBqdmzp6PuthNnR51zuKAv2vwswCwCH1lDmNe2A5S', '123456789', TRUE, 4, 1, 1, 1, NOW(), NOW()),
('María', 'Vargas', 'maria.sucursal2@empresa1.com', '$2b$10$L9WqvZ/2MA57qBqdmzp6PuthNnR51zuKAv2vwswCwCH1lDmNe2A5S', '988333441', TRUE, 5, 1, 2, 2, NOW(), NOW()),
('Jorge', 'Pérez', 'jorge.sede1@empresa1.com', '$2b$10$L9WqvZ/2MA57qBqdmzp6PuthNnR51zuKAv2vwswCwCH1lDmNe2A5S', '988555661', TRUE, 6, 1, 1, 1, NOW(), NOW());

-- 8. Asignar Cobertura a Técnico InSitu (Técnico ID 3 cubre las Zonas 1 y 2)
INSERT INTO tecnicos_zonas (id_tecnico, id_zona, created_at) VALUES
(3, 1, NOW()),
(3, 2, NOW());

-- 9. Insertar Catálogo de Software
INSERT INTO software (nombre_software, licencia, correo, password, fecha_instalacion, fecha_caducidad, proveedor, is_active, created_at, updated_at) VALUES
('Microsoft Office 365', 'Volumen', 'admin@zaint.com', 'O365-pass', '2026-01-01', '2027-01-01', 'Microsoft', TRUE, NOW(), NOW()),
('Adobe Photoshop', 'Individual', 'diseno@innovaciontech.com', 'Ps-pass123', '2026-02-01', '2027-02-01', 'Adobe', TRUE, NOW(), NOW());

-- 10. Insertar Catálogo de Hardware
INSERT INTO hardware (tipo_equipo, numero_serie, fecha_compra, marca, proveedor, url_factura, descripcion, ult_revision, rev_programada, is_active, created_at, updated_at) VALUES
('Disco Duro SSD', 'WD-500GB-998', '2025-12-01', 'Western Digital', 'PC Factory', NULL, 'SSD de 500GB NVMe', NULL, NULL, TRUE, NOW(), NOW()),
('Memoria RAM', 'CR-16GB-445', '2025-12-01', 'Corsair', 'PC Factory', NULL, 'RAM 16GB DDR4', NULL, NULL, TRUE, NOW(), NOW());

-- 11. Insertar Equipos (Asignados al Trabajador ID 6)
INSERT INTO equipos (nombre_equipo, tipo, marca, num_serie, nombre_usuario, ult_revision, rev_programada, id_trabajador, id_cliente, id_sucursal, id_area, is_active, created_at, updated_at) VALUES
('PC-SISTEMAS-01', 'Desktop', 'Dell', 'DL-889900', 'Jorge Pérez', '2026-01-15', '2026-07-15', 6, 1, 1, 1, TRUE, NOW(), NOW()),
('LAP-CONTAB-01', 'Laptop', 'Lenovo', 'LN-112233', 'Jorge Pérez', '2026-02-10', '2026-08-10', 6, 1, 1, 1, TRUE, NOW(), NOW());

-- 12. Asignar Software a Equipos
INSERT INTO software_equipos (id_software, id_equipo, fecha_instalacion, licencia_asignada, is_active, observaciones, created_at, updated_at) VALUES
(1, 1, NOW(), 'O365-KEY-1111', TRUE, 'Instalado para el área de sistemas', NOW(), NOW()),
(1, 2, NOW(), 'O365-KEY-2222', TRUE, 'Instalado para gerencia', NOW(), NOW()),
(2, 2, NOW(), 'PS-KEY-9999', TRUE, 'Licencia individual de diseño', NOW(), NOW());

-- 13. Registrar Historial de Hardware
INSERT INTO registro_hardware (fecha_instalacion, descripcion, serie, proveedor, is_actual, id_hardware, id_equipo, created_at, updated_at) VALUES
(NOW(), 'Ampliación de almacenamiento por falta de espacio', 'WD-500GB-998', 'PC Factory', TRUE, 1, 1, NOW(), NOW()),
(NOW(), 'Aumento de RAM para mejorar rendimiento en edición', 'CR-16GB-445', 'PC Factory', TRUE, 2, 2, NOW(), NOW());

-- 14. Insertar Tickets
INSERT INTO tickets (pin, asunto, detalle, estado, id_equipo, id_trabajador, id_soporte, es_software, created_at, updated_at) VALUES
('TK-101', 'Falla en encendido de PC', 'La computadora de escritorio no enciende tras el corte de energía de esta mañana.', 'Derivado InSitu', 1, 6, 2, FALSE, NOW(), NOW()),
('TK-102', 'Error de licencia en Microsoft Office 365', 'Aparece un aviso de advertencia indicando que la licencia caducará pronto.', 'En Progreso', 1, 6, 2, TRUE, NOW(), NOW()),
('TK-103', 'Lentitud al ejecutar Adobe Photoshop', 'El software se congela al exportar archivos pesados en el equipo portátil.', 'Asignado', 2, 6, 2, TRUE, NOW(), NOW()),
('TK-104', 'Configuración de impresora de red', 'Solicitud de vinculación de la impresora del área de Contabilidad.', 'Cerrado', 2, 6, 3, FALSE, DATE_SUB(NOW(), INTERVAL 2 DAY), NOW());

-- 15. Insertar Citas de Soporte (Relación 1:N directa con Ticket ID 1, Técnico InSitu ID 3, Sucursal ID 1)
INSERT INTO citas_soporte (id_ticket, id_tecnico, id_sucursal, fecha_programada, hora_inicio, hora_fin, estado, observaciones, created_at, updated_at) VALUES
(1, 3, 1, '2026-10-15', '09:00:00', '11:00:00', 'Pendiente', 'Revisión técnica in-situ por problema de encendido eléctrico', NOW(), NOW());

-- 16. Insertar Auditoría de Eventos
INSERT INTO auditoria_eventos (id_ticket, id_cita, id_usuario, tipo_evento, payload, created_at) VALUES
(1, 1, 2, 'SOPORTE_INSITU_ASIGNADO', '{"tecnico_id": 3, "franja": "09:00 - 11:00", "motivo": "Derivación presencial requerida"}', NOW());