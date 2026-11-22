export interface SucursalProps {
  id_sucursal?: number;
  nombre_sucursal: string;
  encargado: string;
  telefono: string;
  direccion: string;
  correo: string;
  is_active: boolean;
  id_cliente: number;
  id_zona: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Sucursal {
  public readonly id_sucursal?: number;
  public readonly nombre_sucursal: string;
  public readonly encargado: string;
  public readonly telefono: string;
  public readonly direccion: string;
  public readonly correo: string;
  public readonly is_active: boolean;
  public readonly id_cliente: number;
  public readonly id_zona: number;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: SucursalProps) {
    this.id_sucursal = props.id_sucursal;
    this.nombre_sucursal = props.nombre_sucursal;
    this.encargado = props.encargado;
    this.telefono = props.telefono;
    this.direccion = props.direccion;
    this.correo = props.correo;
    this.is_active = props.is_active;
    this.id_cliente = props.id_cliente;
    this.id_zona = props.id_zona;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }
}

// Resultado de la creación atómica de una sucursal junto con la cuenta de su
// encargado local (POST /sucursales)
export interface CreateSucursalResult {
  id_sucursal: number;
  nombre_sucursal: string;
  usuario_encargado_id: number;
}

// Empresa (cliente) dueña de la sucursal
export interface SucursalListClienteEmpresa {
  id_cliente: number;
  nombre: string;
  numero_documento: string | null;
}

// Usuario encargado de la sucursal (primer usuario vinculado)
export interface SucursalListEncargado {
  id_usuario: number;
  nombre: string;
  apellido: string;
  telefono_contacto: string;
  correo: string;
}

// Zona geográfica asignada a la sucursal
export interface SucursalListZona {
  id_zona: number;
  nombre: string;
}

// Item del listado paginado de sucursales (GET /sucursales)
export interface SucursalListItem {
  id_sucursal: number;
  nombre_sucursal: string;
  direccion: string;
  // Cantidad total de áreas de la sucursal (Prisma: _count.area)
  total_areas: number;
  is_active: boolean;
  cliente_empresa: SucursalListClienteEmpresa | null;
  encargado: SucursalListEncargado | null;
  zona: SucursalListZona | null;
  createdAt: Date;
  updatedAt: Date;
}

// Área vinculada a la sucursal en el detalle (GET /sucursales/:id)
export interface SucursalDetailArea {
  id_area: number;
  nombre_area: string;
  is_active: boolean;
}

// Empresa (cliente) dueña de la sucursal en el detalle
export interface SucursalDetailClienteEmpresa {
  id_cliente: number;
  nombre_principal: string;
  numero_documento: string | null;
}

// Encargado de la sucursal en el detalle: identidad del usuario vinculado y
// contacto propio de la sucursal
export interface SucursalDetailEncargado {
  id_usuario: number;
  nombre: string;
  apellido: string;
  telefono_contacto: string;
  correo_corporativo: string;
}

// Detalle de una sucursal (GET /sucursales/:id) para el modal del frontend
export interface SucursalDetail {
  id_sucursal: number;
  nombre_sucursal: string;
  is_active: boolean;
  direccion: string;
  id_zona: number | null;
  areasVinculadas: SucursalDetailArea[];
  clienteEmpresa: SucursalDetailClienteEmpresa | null;
  encargado: SucursalDetailEncargado | null;
  createdAt: Date;
  updatedAt: Date;
}

// Total de sucursales y las creadas durante el mes en curso
export interface TotalSucursalesStats {
  cantidad: number;
  nuevasEsteMes: number;
}

// Sedes principales (is_principal)
export interface SedesPrincipalesStats {
  cantidad: number;
}

// Sucursales operativas (activas)
export interface SucursalesOperativasStats {
  cantidad: number;
}

// Áreas cubiertas por las sucursales
export interface AreasCoberturadasStats {
  cantidad: number;
}

// KPIs del dashboard de gestión de sucursales (GET /sucursales/estadisticas)
export interface SucursalStats {
  totalSucursales: TotalSucursalesStats;
  sedesPrincipales: SedesPrincipalesStats;
  sucursalesOperativas: SucursalesOperativasStats;
  areasCoberturadas: AreasCoberturadasStats;
}
