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
  nombres: string;
  usuario: string;
  [key: string]: PrimitiveType;
}

export interface SortConfig<T> {
  key: keyof T;
  direction: "asc" | "desc";
}

export interface Personal extends BaseTableData {
  id: string | number;
  nombres: string;
  correo_electronico: string;
  permisos: string[];
  usuario: string;
  [key: string]: string | number | string[];
}
