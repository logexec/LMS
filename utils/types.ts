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

export interface UserFormData {
  id?: string | number;
  name: string;
  email: string;
  password?: string;
  role_id: number;
  permissions: number[];
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

export interface SortConfig<T> {
  key: keyof T;
  direction: "asc" | "desc";
}

// Descuentos
export interface FormData {
  fechaGasto: string;
  tipo: string;
  factura: string;
  cuenta: string;
  valor: string;
  proyecto: string;
  area?: string;
  responsable: string;
  transporte: string;
  adjunto: File | null;
  observacion: string;
}

export interface BaseFormData {
  fechaGasto: string;
  tipo: string;
  factura: string;
  cuenta: string;
  valor: string;
  proyecto: string;
  observacion: string;
}

export interface NormalFormData extends BaseFormData {
  responsable: string;
  transporte: string;
  adjunto: File | null;
}

export interface MassiveFormData extends BaseFormData {
  area: string;
}

export interface Employee {
  id: string;
  name: string;
  area: string;
  project: string;
  selected: boolean;
}

export interface LoadingState {
  submit: boolean;
  projects: boolean;
  responsibles: boolean;
  transports: boolean;
  accounts: boolean;
  areas: boolean;
}

export interface SelectOption {
  label: string;
  value: string;
}

export interface OptionsState {
  projects: SelectOption[];
  responsibles: SelectOption[];
  transports: SelectOption[];
  accounts: SelectOption[];
  areas: SelectOption[];
}

export interface RequestData {
  type: "discount";
  personnel_type: string;
  request_date: string;
  invoice_number: string;
  account_id: string;
  amount: string;
  project: string;
  area?: string;
  responsible_id?: string;
  transport_id?: string | null;
  note: string;
}

export interface NormalRequestData {
  type: "discount";
  personnel_type: string;
  request_date: string;
  invoice_number: string;
  account_id: string;
  amount: string;
  project: string;
  responsible_id?: string;
  transport_id?: string | null;
  note: string;
  adjunto: File | null;
}

export interface MassiveRequestData {
  type: "massive_discount";
  request_date: string;
  invoice_number: string;
  account_id: string;
  total_amount: string;
  project: string;
  area: string;
  employees: string[];
  note: string;
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
