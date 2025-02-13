export interface Role {
  id: string;
  name: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role_id: string;
  permissions: Permission[];
  projects: Project[];
}

export interface Permission {
  id: string;
  name: string;
}

export interface CreateUserFormData {
  name: string;
  email: string;
  password: string;
  role_id: string;
  dob?: string;
}

export interface CreateUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserFormData) => void;
  roles: Role[];
  isLoading: boolean;
}

export interface EditUserDialogProps {
  user: User | null;
  roles: Role[];
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<CreateUserFormData>) => void;
  isLoading: boolean;
}

export interface PermissionsDialogProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (permissions: string[]) => void;
  isLoading: boolean;
}

export interface DeleteUserDialogProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
}

export interface ProjectsDialogProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (projectIds: string[]) => void;
  isLoading: boolean;
}
