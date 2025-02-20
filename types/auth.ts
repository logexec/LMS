export interface Permission {
  id: number;
  name: string;
}

export interface Role {
  id: number;
  name: string;
}

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
  assignedProjects: string[];
  area?: string;
}
