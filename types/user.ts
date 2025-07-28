export interface User {
  id: string;
  nombre: string;
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