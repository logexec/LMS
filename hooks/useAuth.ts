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
    console.log("Permiso solicitado:", permission);
    if (!context.user?.permissions) return false;

    const userPermissions = context.user.permissions.map((p) => p.name);

    const checkSinglePermission = (perm: string): boolean => {
      // Si el usuario tiene el permiso exacto
      if (userPermissions.includes(perm)) return true;

      // Lógica jerárquica
      if (perm.startsWith("view_")) {
        const resource = perm.replace("view_", "");
        return (
          userPermissions.includes(`edit_${resource}`) ||
          userPermissions.includes(`manage_${resource}`)
        );
      }
      if (perm.startsWith("edit_")) {
        const resource = perm.replace("edit_", "");
        return userPermissions.includes(`manage_${resource}`);
      }
      return false;
    };

    if (Array.isArray(permission)) {
      return permission.every((p) => checkSinglePermission(p));
    }

    return checkSinglePermission(permission);
  };

  const hasProjects = (): string[] => {
    if (!context.user?.assignedProjects) return [];

    // Ajuste: Verifica si assignedProjects es un arreglo directo o un objeto con una propiedad projects
    if (Array.isArray(context.user.assignedProjects)) {
      return context.user.assignedProjects;
    }
    return (
      context.user.assignedProjects.projects?.map(
        (project: string) => project
      ) || []
    );
  };

  return {
    ...context,
    hasRole,
    hasPermission,
    hasProjects,
  };
};
