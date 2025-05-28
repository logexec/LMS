/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

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
  id?: number | string;
  created_at?: string;
  updated_at?: string;
}

export interface RequestProps extends BaseEntity {
  unique_id: string;
  updated_at: string;
  invoice_number: number | string;
  account_id: string;
  account_name?: string;
  project_name?: string;
  amount: number;
  project: string | string[];
  responsible_id: string | null;
  vehicle_plate: string | null;
  vehicle_number: string | null;
  note: string | null;
  status: Status;
  type: RequestType;
  attachment_path: string | null;
  personnel_type?: string;
  request_date?: string;
  when?: string;
  month?: string;
  reposicion_id?: string;
}

export interface AccountProps extends BaseEntity {
  name: string;
  account_number?: string;
  account_type?: string;
  account_status?: string;
  account_affects?: string;
  generates_income?: boolean;
}

export interface ResponsibleProps {
  id: string | number;
  nombre_completo: string;
  proyecto: string;
}

export interface TransportProps {
  vehicle_plate: string;
  vehicle_number: string;
}

export interface ProjectProps {
  id: string;
  name: string;
}

export interface ReposicionProps {
  id: number;
  unique_id: string;
  fecha_reposicion: string;
  total_reposicion: number;
  status: Status;
  project: string;
  type?: "expense" | "discount";
  detail: any[];
  month: string;
  when:
    | "rol"
    | "liquidación"
    | "decimo_tercero"
    | "decimo_cuarto"
    | "utilidades";
  note?: string;
  vehicle_plate?: string;
  vehicle_number?: string;
  responsible_id?: string;
  amount?: number;
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
  type?: "discount" | "expense" | "income";
  onStatusChange?: (id: number, status: Status) => Promise<void>;
  onCreateReposicion?: (
    requestIds: string[],
    file: File,
    formData?: any
  ) => Promise<void>;
  onUpdateReposicion?: (
    id: number,
    updateData: ReposicionUpdateData,
    previousStatus: Status
  ) => Promise<void>;
  status?: Status | Status[];
  repositionId?: number | string;
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
  assignedProjects: {
    id: number;
    user_id: number;
    projects: string[];
  };
  area?: string;
  dob?: string;
  phone?: string;
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
  vehicles?: Array<{ label: string; value: string }>;
}

export interface NormalFormData {
  fechaGasto: string;
  tipo: string;
  factura: string;
  cuenta: string;
  valor: string;
  proyecto: string;
  responsable: string;
  vehicle_plate?: string;
  vehicle_number?: string;
  observacion: string;
}

export interface NormalRequestData {
  type: string;
  personnel_type: string;
  request_date: string;
  invoice_number: number | string;
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

export interface Project {
  id: string;
  name: string;
  description?: string;
}

export interface AssignedProjects {
  id: number;
  user_id: number;
  projects: string[];
  created_at: string;
  updated_at: string;
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
  vehicles?: boolean;
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
  vehicles?: SelectOption[];
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
  invoice_number: number | string;
  account_id: string;
  amount: string;
  project: string;
  responsible_id: string;
  transport_id: string | null;
  note: string;
}

// Ordenes de Compra

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  ruc?: string;
  proyecto?: string;
  mesDeServicio?: string;
  accountCode?: string;
  vendor: string;
  items: OrderItem[];
  total: number;
  status: "solicitado" | "aprobado" | "rechazado" | "cancelado";
  createdAt: Date;
  dueDate: Date;
  documents?: Document[];
}

export interface Document {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

export interface OrderItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

// Fin Ordenes de Compra

// Préstamos

export interface Option {
  label: string;
  value: string;
}

export interface OptionsState {
  projects: Option[];
  responsibles: Option[];
  transports: Option[];
  accounts: Option[];
  areas: Option[];
  vehicles?: Option[];
}

export interface LoanFormData {
  type: "nomina" | "proveedor";
  account_id: string;
  amount: string;
  project: string;
  invoice_number: string;
  installments: string;
  responsible_id?: string;
  vehicle_id?: string;
  note: string;
  installment_dates: string[]; // Formato Y-m (ej. "2025-04")
}

export interface Installment {
  date: string; // Formato Y-m
  amount: number;
}

// Fin Préstamos

// API
export interface RequestFilters {
  period?: "last_week" | "last_month" | "all";
  project?: string;
  type?: "expense" | "discount" | "income";
  status?: "pending" | "rejected" | "approved";
}

export interface RequestUpdateData {
  invoice_number?: string;
  amount?: string;
  note?: string;
  // Add more fields if needed
}

export interface RepositionFilters {
  period?: "last_week" | "last_month" | "all";
  project?: string;
  type?: "expense" | "discount" | "income" | "all";
  status?: "rejected" | "pending" | "paid" | "all";
  mode?: "all" | "income";
}

export interface RepositionUpdateData {
  total?: number;
  date?: Date;
  note: string;
  status: "rejected" | "paid";
  when?: string;
  month?: string;
}
