import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

// Función que lee las políticas desde el archivo JSON
const getPolicies = () => {
  const policiesPath = path.join(process.cwd(), "policies/policies.json");
  const rawData = fs.readFileSync(policiesPath, "utf-8");
  return JSON.parse(rawData).policies;
};

// Función para verificar permisos
export const checkPermission = (
  role: string,
  resource: string,
  action: string
): boolean => {
  const policies = getPolicies();
  const permission = policies.find(
    (policy: { role: string; resource: string; action: string }) =>
      policy.role === role &&
      policy.resource === resource &&
      policy.action === action
  );
  return permission !== undefined;
};

// Middleware para Next.js API
export const withPermission = (resource: string, action: string) => {
  return async (
    req: NextApiRequest,
    res: NextApiResponse,
    next: () => void
  ) => {
    const role = req.headers["x-role"] as string; // Asume que el rol viene en los headers

    if (!role) {
      return res
        .status(403)
        .json({ message: "Rol de usuario no especificado" });
    }

    const hasPermission = checkPermission(role, resource, action);

    if (hasPermission) {
      return next(); // Si tiene permiso, continua con la ejecución
    } else {
      return res.status(403).json({ message: "Acceso denegado" });
    }
  };
};
