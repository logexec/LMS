// Auth
export interface User {
  id: string;
  name: string;
  email: string;
  role: {
    id: number;
    name: string;
  };
  permissions: Array<{
    id: number;
    name: string;
  }>;
}

export interface LoginResponse {
  access_token: string;
  jwt_token: string;
  token_type: string;
  user: User;
}

export interface NavLink {
  category: string;
  requiredPermissions?: string[];
  links: Array<{
    label: string;
    url: string;
    icon: any;
    requiredPermissions?: string[];
  }>;
}

// General
export type PrimitiveValue =
  | string
  | number
  | boolean
  | Date
  | null
  | undefined
  | string[];

export type RecordValue = Record<string, PrimitiveValue>;

export interface BaseTableData extends RecordValue {
  id: string | number;
  [key: string]: PrimitiveValue;
}

export interface Permission {
  id: number;
  name: string;
}

export interface Role {
  id: number;
  name: string;
}

export interface User extends BaseTableData {
  name: string;
  email: string;
  role_id: number;
  role: Role;
  permissions: Permission[];
  [key: string]: any;
}

// Interfaz para la respuesta cruda de la API
export interface ApiResponseRaw {
  data: User[];
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
}

// Interfaz para los datos procesados
export interface ApiResponse {
  data: User[];
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
}

// Interfaz para el formulario de creación/edición
export interface UserFormData {
  id?: string | number;
  name: string;
  email: string;
  password?: string;
  role_id: number;
  permissions: number[]; // Solo IDs de permisos para enviar al servidor
}

export interface ErrorMessage {
  status: number;
  message: string;
}
export type PrimitiveType = string | number | boolean | string[];

export interface PaginationInfo {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationInfo;
}

export interface Column<T extends BaseTableData> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: <K extends keyof T>(value: T[K], row: T) => React.ReactNode;
}

export interface DataTableProps<T extends BaseTableData> {
  data: PaginatedResponse<T>;
  columns: Column<T>[];
  onSelectionChange?: (selectedItems: T[]) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onPageChange: (page: number, sortConfig?: SortConfig<T>) => void;
  className?: string;
  showActions?: boolean;
  showExport?: boolean;
}

export interface BasePersonal {
  correo_electronico: string;
  permisos: string[];
}

// Interfaz para el formulario
export interface PersonalForm extends BasePersonal {
  [key: string]: PrimitiveType;
}

// Interfaz para la tabla
export interface PersonalTable extends BasePersonal {
  id: string | number;
  role_id: number;
  name: string;
  email: string;
  permissions: string[];
  [key: string]: PrimitiveType;
}

export interface SortConfig<T> {
  key: keyof T;
  direction: "asc" | "desc";
}

export interface Personal extends BaseTableData {
  id: string | number;
  role_id: number;
  name: string;
  email: string;
  permissions: string[];
  [key: string]: string | number | string[];
}
