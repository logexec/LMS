import { useContext } from "react";
import { AuthContext } from "@/contexts/AuthContext";

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  const hasRole = (role: string | string[]): boolean => {
    if (!context.user?.role) return false;

    if (Array.isArray(role)) {
      return role.includes(context.user.role.name);
    }
    return context.user.role.name === role;
  };

  const hasPermission = (permission: string | string[]): boolean => {
    if (!context.user?.permissions) return false;

    const userPermissions = context.user.permissions.map((p) => p.name);

    if (Array.isArray(permission)) {
      return permission.some((p) => userPermissions.includes(p));
    }
    return userPermissions.includes(permission);
  };

  const hasProjects = (): string[] => {
    if (!context.user?.assignedProjects) return [];

    return context.user.assignedProjects.projects.map((project) => project);
  };

  return {
    ...context,
    hasRole,
    hasPermission,
    hasProjects,
  };
};
