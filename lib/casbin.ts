import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

const getPolicies = () => {
  const policiesPath = path.join(process.cwd(), "policies/policies.json");
  const rawData = fs.readFileSync(policiesPath, "utf-8");
  return JSON.parse(rawData).policies;
};

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
  return async (req: NextApiRequest, res: NextApiResponse, next: Function) => {
    const role = req.headers["x-role"] as string; // Asume que el rol viene en los headers

    if (!role) {
      return res
        .status(403)
        .json({ message: "No tienes permisos para acceder a esta sección." });
    }

    const hasPermission = checkPermission(role, resource, action);

    if (hasPermission) {
      return next();
    } else {
      return res.status(403).json({ message: "Acceso denegado." });
    }
  };
};
