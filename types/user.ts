export interface User {
  id: number
  nombre: string
  email: string;
  rol: {
    id: number;
    name: string;
  }
  cedula: string
  dob: string
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
  phone?: string;
}