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
-- IDs: 1=ADMINISTRADOR, 2=SOPORTE_TECNICO, 3=SOPORTE_INSITU, 4=CLIENTE_EMPRESA, 5=CLIENTE_SUCURSAL, 6=CLIENTE_TRABAJADOR
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

-- 3. Insertar Clientes (Empresas)
-- ID 1: Plan 3 | ID 2: Plan 2 | ID 3: Plan 3
INSERT INTO clientes (tipo_cliente, numero_documento, nombre_principal, direccion, telefono, correo, rubro, id_plan, fecha_inicio_plan, fecha_finalizacion_plan, costo_negociado, limite_equipos_contratado, is_active, created_at, updated_at) VALUES
('JURIDICA', '20555666777', 'Innovación Global Tech', 'Av. Principal 123', '987654321', 'admin@innovaciontech.com', 'Tecnología', 3, '2026-01-01', '2027-01-01', 399.99, 500, TRUE, NOW(), NOW()),
('JURIDICA', '20601122334', 'Andes Logística y Carga', 'Av. Argentina 1420', '987112233', 'gerencia@andeslogistica.pe', 'Logística y Transporte', 2, '2026-02-01', '2027-02-01', 149.99, 100, TRUE, NOW(), NOW()),
('JURIDICA', '20609988771', 'Pacífico Retail Corporativo', 'Av. Javier Prado Este 4200', '987445566', 'ti@pacificoretail.pe', 'Retail y Comercio', 3, '2026-03-01', '2027-03-01', 399.99, 500, TRUE, NOW(), NOW());

-- 4. Insertar Zonas Geográficas
-- ID 1: Lima Centro / San Isidro | ID 2: Lima Norte | ID 3: Lima Sur / Surco
INSERT INTO zonas (nombre_zona, descripcion, is_active, created_at, updated_at) VALUES
('Lima Centro / San Isidro', 'Cubre las sedes financieras y corporativas principales', TRUE, NOW(), NOW()),
('Lima Norte', 'Cubre las sucursales del sector industrial y comercial norte', TRUE, NOW(), NOW()),
('Lima Sur / Surco', 'Cubre las sedes comerciales y de atención al sur de Lima', TRUE, NOW(), NOW());

-- 5. Insertar Sucursales (con coordenadas para Google Maps)
-- ID 1: Sede Central (Cliente 1, Zona 1)
-- ID 2: Sucursal Norte (Cliente 1, Zona 2)
-- ID 3: Planta Callao / Logística (Cliente 2, Zona 2)
-- ID 4: Agencia Miraflores (Cliente 2, Zona 1)
-- ID 5: Tienda Surco Jockey (Cliente 3, Zona 3)
INSERT INTO sucursales (nombre_sucursal, encargado, telefono, direccion, correo, latitud, longitud, id_cliente, id_zona, is_principal, is_active, created_at, updated_at) VALUES
('Sede Central', 'Carlos Mendoza', '01-444-5555', 'Av. Principal 123', 'sede.central@innovaciontech.com', -12.09641200, -77.03542100, 1, 1, TRUE, TRUE, NOW(), NOW()),
('Sucursal Norte', 'María Vargas', '01-555-6666', 'Av. Norte 456', 'norte@innovaciontech.com', -11.99123400, -77.06234500, 1, 2, FALSE, TRUE, NOW(), NOW()),
('Planta Callao / Logística', 'Lucía Paredes', '01-452-8890', 'Av. Argentina 1420, Callao', 'callao@andeslogistica.pe', -12.04982100, -77.11023400, 2, 2, TRUE, TRUE, NOW(), NOW()),
('Agencia Miraflores', 'Diego Salinas', '01-241-7730', 'Av. José Pardo 610, Miraflores', 'miraflores@andeslogistica.pe', -12.12114500, -77.03219800, 2, 1, FALSE, TRUE, NOW(), NOW()),
('Tienda Surco Jockey', 'Martín Flores', '01-618-3210', 'Av. Javier Prado Este 4200, Santiago de Surco', 'surco@pacificoretail.pe', -12.08541000, -76.97654000, 3, 3, TRUE, TRUE, NOW(), NOW());

-- 6. Insertar Áreas
-- IDs 1,2 -> Sucursal 1 | IDs 3,4 -> Sucursal 2 | ID 5 -> Sucursal 3 | ID 6 -> Sucursal 4 | ID 7 -> Sucursal 5
INSERT INTO area (nombre_area, contacto, telefono, correo, id_sucursal, is_active, created_at, updated_at) VALUES
('Sistemas y TI', 'Juan Perez', '01-444-5556', 'sistemas@innovaciontech.com', 1, TRUE, NOW(), NOW()),
('Contabilidad', 'Ana Gomez', '01-444-5557', 'contabilidad@innovaciontech.com', 1, TRUE, NOW(), NOW()),
('Operaciones Norte', 'María Vargas', '01-555-6667', 'operaciones.norte@innovaciontech.com', 2, TRUE, NOW(), NOW()),
('Almacén Norte', 'Pedro Ruiz', '01-555-6668', 'almacen.norte@innovaciontech.com', 2, TRUE, NOW(), NOW()),
('Despacho y Flota', 'Lucía Paredes', '01-452-8891', 'despacho@andeslogistica.pe', 3, TRUE, NOW(), NOW()),
('Atención Comercial', 'Diego Salinas', '01-241-7731', 'comercial.miraflores@andeslogistica.pe', 4, TRUE, NOW(), NOW()),
('Punto de Venta y Caja', 'Martín Flores', '01-618-3211', 'pos.surco@pacificoretail.pe', 5, TRUE, NOW(), NOW());

-- 7. Insertar Usuarios (incluyendo CLIENTE_EMPRESA [4] y CLIENTE_SUCURSAL [5] por empresa/sucursal)
-- ID 1: Admin | ID 2: Soporte Técnico | ID 3: Soporte InSitu
-- ID 4: CLIENTE_EMPRESA (Cliente 1) | ID 5: CLIENTE_SUCURSAL (Cliente 1, Sucursal 2) | ID 6: CLIENTE_TRABAJADOR (Cliente 1, Sucursal 1)
-- ID 7: CLIENTE_EMPRESA (Cliente 2) | ID 8: CLIENTE_SUCURSAL (Cliente 2, Sucursal 3) | ID 9: CLIENTE_SUCURSAL (Cliente 2, Sucursal 4) | ID 10: CLIENTE_TRABAJADOR (Cliente 2, Sucursal 3)
-- ID 11: CLIENTE_EMPRESA (Cliente 3) | ID 12: CLIENTE_SUCURSAL (Cliente 3, Sucursal 5) | ID 13: CLIENTE_TRABAJADOR (Cliente 3, Sucursal 5)
INSERT INTO usuarios (nombre, apellido, correo, password, telefono, is_active, id_rol, id_cliente, id_sucursal, id_area, created_at, updated_at) VALUES
('Daniel', 'Singer', 'admin@zaint.com', '$2b$10$L9WqvZ/2MA57qBqdmzp6PuthNnR51zuKAv2vwswCwCH1lDmNe2A5S', '987654321', TRUE, 1, NULL, NULL, NULL, NOW(), NOW()),
('Ana', 'López', 'ana.soporte@zaint.com', '$2b$10$L9WqvZ/2MA57qBqdmzp6PuthNnR51zuKAv2vwswCwCH1lDmNe2A5S', '999888771', TRUE, 2, NULL, NULL, NULL, NOW(), NOW()),
('Luis', 'Torres', 'luis.insitu@zaint.com', '$2b$10$L9WqvZ/2MA57qBqdmzp6PuthNnR51zuKAv2vwswCwCH1lDmNe2A5S', '999888772', TRUE, 3, NULL, NULL, NULL, NOW(), NOW()),
('Carlos', 'Mendoza', 'example@gmail.com', '$2b$10$L9WqvZ/2MA57qBqdmzp6PuthNnR51zuKAv2vwswCwCH1lDmNe2A5S', '123456789', TRUE, 4, 1, 1, 1, NOW(), NOW()),
('María', 'Vargas', 'maria.sucursal2@empresa1.com', '$2b$10$L9WqvZ/2MA57qBqdmzp6PuthNnR51zuKAv2vwswCwCH1lDmNe2A5S', '988333441', TRUE, 5, 1, 2, 3, NOW(), NOW()),
('Jorge', 'Pérez', 'jorge.sede1@empresa1.com', '$2b$10$L9WqvZ/2MA57qBqdmzp6PuthNnR51zuKAv2vwswCwCH1lDmNe2A5S', '988555661', TRUE, 6, 1, 1, 1, NOW(), NOW()),
('Roberto', 'Quispe', 'empresa.andes@andeslogistica.pe', '$2b$10$L9WqvZ/2MA57qBqdmzp6PuthNnR51zuKAv2vwswCwCH1lDmNe2A5S', '987112200', TRUE, 4, 2, 3, 5, NOW(), NOW()),
('Lucía', 'Paredes', 'sucursal.callao@andeslogistica.pe', '$2b$10$L9WqvZ/2MA57qBqdmzp6PuthNnR51zuKAv2vwswCwCH1lDmNe2A5S', '987112201', TRUE, 5, 2, 3, 5, NOW(), NOW()),
('Diego', 'Salinas', 'sucursal.miraflores@andeslogistica.pe', '$2b$10$L9WqvZ/2MA57qBqdmzp6PuthNnR51zuKAv2vwswCwCH1lDmNe2A5S', '987112202', TRUE, 5, 2, 4, 6, NOW(), NOW()),
('Sofía', 'Huamán', 'sofia.callao@andeslogistica.pe', '$2b$10$L9WqvZ/2MA57qBqdmzp6PuthNnR51zuKAv2vwswCwCH1lDmNe2A5S', '987112203', TRUE, 6, 2, 3, 5, NOW(), NOW()),
('Valeria', 'Castro', 'empresa.pacifico@pacificoretail.pe', '$2b$10$L9WqvZ/2MA57qBqdmzp6PuthNnR51zuKAv2vwswCwCH1lDmNe2A5S', '987445500', TRUE, 4, 3, 5, 7, NOW(), NOW()),
('Martín', 'Flores', 'sucursal.surco@pacificoretail.pe', '$2b$10$L9WqvZ/2MA57qBqdmzp6PuthNnR51zuKAv2vwswCwCH1lDmNe2A5S', '987445501', TRUE, 5, 3, 5, 7, NOW(), NOW()),
('Camila', 'Rojas', 'camila.surco@pacificoretail.pe', '$2b$10$L9WqvZ/2MA57qBqdmzp6PuthNnR51zuKAv2vwswCwCH1lDmNe2A5S', '987445502', TRUE, 6, 3, 5, 7, NOW(), NOW());

-- 8. Asignar Cobertura a Técnico InSitu (ID 3)
INSERT INTO tecnicos_zonas (id_tecnico, id_zona, created_at) VALUES
(3, 1, NOW()),
(3, 2, NOW()),
(3, 3, NOW());

-- 9. Insertar Catálogo de Software
INSERT INTO software (id_cliente, id_sucursal, nombre_software, categoria, tipo_licencia, licencia_master_key, proveedor, limite_equipos, licencias_usadas, fecha_compra, fecha_caducidad, estado, is_active, created_at, updated_at) VALUES
(1, 1, 'Microsoft Office 365', 'Ofimática', 'Corporativa Flotante', 'O365-MASTER-KEY', 'Microsoft', 50, 2, '2026-01-01', '2027-01-01', 'Activo', TRUE, NOW(), NOW()),
(1, 1, 'Adobe Photoshop', 'Diseño', 'Monousuario / OEM', 'PS-MASTER-KEY', 'Adobe', 5, 1, '2026-02-01', '2027-02-01', 'Activo', TRUE, NOW(), NOW()),
(2, 3, 'SAP Business One Client', 'ERP / Gestión', 'Corporativa Flotante', 'SAPB1-ANDES-KEY', 'SAP', 30, 5, '2026-02-01', '2027-02-01', 'Activo', TRUE, NOW(), NOW()),
(3, 5, 'POS Retail Suite', 'Punto de Venta', 'Empresarial Ilimitada', 'POS-PACIFICO-KEY', 'RetailSoft', 100, 12, '2026-03-01', '2027-03-01', 'Activo', TRUE, NOW(), NOW());

-- 10. Insertar Equipos
-- ID 1: Cliente 1, Sucursal 1, Área 1, Trabajador 6
-- ID 2: Cliente 1, Sucursal 1, Área 1, Trabajador 6
-- ID 3: Cliente 1, Sucursal 2, Área 3, Trabajador 5
-- ID 4: Cliente 2, Sucursal 3, Área 5, Trabajador 10
-- ID 5: Cliente 3, Sucursal 5, Área 7, Trabajador 13
INSERT INTO equipos (nombre_equipo, tipo, marca_modelo, num_serie, estado, ult_revision, rev_programada, id_trabajador, id_cliente, id_sucursal, id_area, is_active, created_at, updated_at) VALUES
('PC-SISTEMAS-01', 'Desktop', 'Dell OptiPlex 7090', 'DL-889900', 'Activo', '2026-01-15', '2026-07-15', 6, 1, 1, 1, TRUE, NOW(), NOW()),
('LAP-CONTAB-01', 'Laptop', 'Lenovo ThinkPad', 'LN-112233', 'Activo', '2026-02-10', '2026-08-10', 6, 1, 1, 1, TRUE, NOW(), NOW()),
('PC-NORTE-01', 'Desktop', 'HP ProDesk 400 G9', 'HP-774411', 'Activo', '2026-05-12', '2026-11-12', 5, 1, 2, 3, TRUE, NOW(), NOW()),
('LAP-CALLAO-01', 'Laptop', 'Dell Latitude 5440', 'DL-552299', 'Activo', '2026-06-20', '2026-12-20', 10, 2, 3, 5, TRUE, NOW(), NOW()),
('POS-SURCO-01', 'Terminal POS', 'Epson OmniLink TM-T88VI', 'EP-336699', 'Activo', '2026-07-05', '2027-01-05', 13, 3, 5, 7, TRUE, NOW(), NOW());

-- 11. Insertar Catálogo de Hardware
INSERT INTO hardware (tipo_componente, marca_modelo, numero_serie, proveedor, fecha_compra, costo_unitario, url_factura, estado, id_equipo_actual, created_at, updated_at) VALUES
('Almacenamiento SSD/NVMe', 'Western Digital NVMe 500GB', 'WD-500GB-998', 'PC Factory', '2025-12-01', 50.00, NULL, 'Instalado', 1, NOW(), NOW()),
('Memoria RAM', 'Corsair 16GB DDR4', 'CR-16GB-445', 'PC Factory', '2025-12-01', 40.00, NULL, 'Instalado', 2, NOW(), NOW());

-- 12. Asignar Software a Equipos
INSERT INTO software_equipos (id_software, id_equipo, licencia_especifica, correo_asociado, password_enc, fecha_instalacion, fecha_vencimiento, observaciones, is_active, created_at, updated_at) VALUES
(1, 1, 'O365-KEY-1111', 'jorge.sede1@empresa1.com', '$2b$10$L9WqvZ/2MA57qBqdmzp6PuthNnR51zuKAv2vwswCwCH1lDmNe2A5S', NOW(), '2027-01-01', 'Instalado para el área de sistemas', TRUE, NOW(), NOW()),
(1, 2, 'O365-KEY-2222', 'jorge.sede1@empresa1.com', '$2b$10$L9WqvZ/2MA57qBqdmzp6PuthNnR51zuKAv2vwswCwCH1lDmNe2A5S', NOW(), '2027-01-01', 'Instalado para gerencia', TRUE, NOW(), NOW()),
(2, 2, 'PS-KEY-9999', 'diseno@innovaciontech.com', '$2b$10$L9WqvZ/2MA57qBqdmzp6PuthNnR51zuKAv2vwswCwCH1lDmNe2A5S', NOW(), '2027-02-01', 'Licencia individual de diseño', TRUE, NOW(), NOW());

-- 13. Registrar Historial de Hardware
INSERT INTO registro_hardware (fecha_instalacion, motivo_retiro, salud_smart, is_actual, id_hardware, id_equipo, id_tecnico_resp, created_at, updated_at) VALUES
(NOW(), NULL, '100% OK - NVMe Saludable', TRUE, 1, 1, 3, NOW(), NOW()),
(NOW(), NULL, '98% OK - RAM Estable', TRUE, 2, 2, 3, NOW(), NOW());

-- 14. Insertar Tickets
INSERT INTO tickets (pin, asunto, detalle, estado, id_equipo, id_trabajador, id_soporte, es_software, created_at, updated_at) VALUES
('TK-101', 'Falla en encendido de PC', 'La computadora de escritorio no enciende tras el corte de energía de esta mañana.', 'Derivado InSitu', 1, 6, 2, FALSE, NOW(), NOW()),
('TK-102', 'Error de licencia en Microsoft Office 365', 'Aparece un aviso de advertencia indicando que la licencia caducará pronto.', 'En Progreso', 1, 6, 2, TRUE, NOW(), NOW()),
('TK-103', 'Lentitud al ejecutar Adobe Photoshop', 'El software se congela al exportar archivos pesados en el equipo portátil.', 'Asignado', 2, 6, 2, TRUE, NOW(), NOW()),
('TK-104', 'Configuración de impresora de red', 'Solicitud de vinculación de la impresora del área de Contabilidad.', 'Cerrado', 2, 6, 3, FALSE, DATE_SUB(NOW(), INTERVAL 2 DAY), NOW()),
('TK-105', 'Sin conexión a red en estación de almacén', 'El equipo de sucursal norte no obtiene IP por cableado estructurado.', 'Derivado InSitu', 3, 5, 2, FALSE, NOW(), NOW()),
('TK-106', 'Falla de lector de códigos en terminal POS', 'La terminal de caja en Surco no responde al escáner de productos.', 'Derivado InSitu', 5, 13, 2, FALSE, NOW(), NOW());

-- 15. Insertar Citas de Soporte con fechas actuales
-- Cita 1: Hoy, Sucursal 1 (Sede Central - Cliente 1), Pendiente
-- Cita 2: Hoy, Sucursal 2 (Sucursal Norte - Cliente 1), En Camino
-- Cita 3: Ayer, Sucursal 1 (Sede Central - Cliente 1), Completada
-- Cita 4: Hoy, Sucursal 3 (Planta Callao - Cliente 2), Pendiente
-- Cita 5: Mañana, Sucursal 5 (Tienda Surco Jockey - Cliente 3), Pendiente
INSERT INTO citas_soporte (id_ticket, id_tecnico, id_sucursal, fecha_programada, hora_inicio, hora_fin, estado, observaciones, created_at, updated_at) VALUES
(1, 3, 1, CURDATE(), '09:00:00', '11:00:00', 'Pendiente', 'Revisión técnica in-situ por problema de encendido eléctrico', NOW(), NOW()),
(5, 3, 2, CURDATE(), '11:30:00', '13:30:00', 'En Camino', 'Verificación de punto de red y switch en Sucursal Norte', NOW(), NOW()),
(4, 3, 1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '14:00:00', '16:00:00', 'Completada', 'Instalación y prueba de impresora de red completada', DATE_SUB(NOW(), INTERVAL 1 DAY), NOW()),
(6, 3, 3, CURDATE(), '15:00:00', '17:00:00', 'Pendiente', 'Revisión de conectividad VPN y acceso SAP en Planta Callao', NOW(), NOW()),
(6, 3, 5, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '10:00:00', '12:00:00', 'Pendiente', 'Diagnóstico y reemplazo de escáner en Tienda Surco Jockey', NOW(), NOW());

-- 16. Insertar Auditoría de Eventos
INSERT INTO auditoria_eventos (id_ticket, id_cita, id_usuario, tipo_evento, payload, created_at) VALUES
(1, 1, 2, 'SOPORTE_INSITU_ASIGNADO', '{"tecnico_id": 3, "franja": "09:00 - 11:00", "motivo": "Derivación presencial requerida"}', NOW()),
(5, 2, 2, 'SOPORTE_INSITU_ASIGNADO', '{"tecnico_id": 3, "franja": "11:30 - 13:30", "motivo": "Falla de red física en sucursal norte"}', NOW()),
(4, 3, 2, 'SOPORTE_INSITU_COMPLETADO', '{"tecnico_id": 3, "resultado": "Impresora configurada y operativa"}', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(6, 4, 2, 'SOPORTE_INSITU_ASIGNADO', '{"tecnico_id": 3, "franja": "15:00 - 17:00", "motivo": "Soporte presencial en planta Callao"}', NOW()),
(6, 5, 2, 'SOPORTE_INSITU_ASIGNADO', '{"tecnico_id": 3, "franja": "10:00 - 12:00", "motivo": "Soporte presencial programado en Surco"}', NOW());