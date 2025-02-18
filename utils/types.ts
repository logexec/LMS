//Tabla de Reposiciones, Gastos y Descuentos

export enum Status {
  pending = "pending",
  paid = "paid",
  rejected = "rejected",
  review = "review",
  in_reposition = "in_reposition",
}

export type TableMode = "requests" | "reposiciones";
export type RequestType = "discount" | "expense";

export interface BaseEntity {
  id: number;
  created_at: string;
  updated_at: string;
}

export interface RequestProps extends BaseEntity {
  unique_id: string;
  updated_at: string;
  invoice_number: string;
  account_id: number;
  amount: number;
  project: string;
  responsible_id: string | null;
  transport_id: string | null;
  note: string | null;
  status: Status;
  type: RequestType;
  attachment_path: string | null;
  personnel_type?: string;
  request_date?: string;
}

export interface AccountProps extends BaseEntity {
  name: string;
  account_number: string;
  account_type: string;
}

export interface ResponsibleProps {
  id: string;
  nombre_completo: string;
}

export interface TransportProps {
  id: string;
  name: string;
}

export interface ReposicionProps {
  id: number;
  fecha_reposicion: string;
  total_reposicion: number;
  status: Status;
  project: string;
  detail: any[];
  month: string;
  when:
    | "rol"
    | "liquidación"
    | "decimo_tercero"
    | "decimo_cuarto"
    | "utilidades";
  note?: string;
  requests?: any[];
}

export interface ReposicionFormData {
  month: string;
  when: string;
  note: string;
}

export interface ReposicionUpdateData {
  status: Status;
  month?: string;
  when?:
    | "rol"
    | "liquidación"
    | "decimo_tercero"
    | "decimo_cuarto"
    | "utilidades";
  note?: string;
}

export interface DataTableProps<TData> {
  mode: "requests" | "reposiciones";
  type?: "discount" | "expense";
  onStatusChange?: (id: number, status: Status) => Promise<void>;
  onCreateReposicion?: (requestIds: string[], file: File) => Promise<void>;
  onUpdateReposicion?: (
    id: number,
    updateData: ReposicionUpdateData,
    previousStatus: Status
  ) => Promise<void>;
}

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
export interface LoadingState {
  submit: boolean;
  projects: boolean;
  responsibles: boolean;
  transports: boolean;
  accounts: boolean;
  areas: boolean;
}

export interface OptionsState {
  projects: Array<{ label: string; value: string }>;
  responsibles: Array<{ label: string; value: string }>;
  transports: Array<{ label: string; value: string }>;
  accounts: Array<{ label: string; value: string }>;
  areas: Array<{ label: string; value: string }>;
}

export interface NormalFormData {
  fechaGasto: string;
  tipo: string;
  factura: string;
  cuenta: string;
  valor: string;
  proyecto: string;
  responsable: string;
  transporte: string;
  observacion: string;
}

export interface NormalRequestData {
  type: string;
  personnel_type: string;
  request_date: string;
  invoice_number: string;
  account_id: string;
  amount: string;
  project: string;
  responsible_id: string;
  transport_id: string | null;
  note: string;
}

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
  adjunto: Blob;
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
}

export interface MassiveFormData extends NormalFormData {
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
  [key: string]: string | Blob | null | undefined;
}

export interface NormalRequestData {
  type: string;
  personnel_type: string;
  request_date: string;
  invoice_number: string;
  account_id: string;
  amount: string;
  project: string;
  responsible_id: string;
  transport_id: string | null;
  note: string;
}
