"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Save, Plus, Edit2 } from "lucide-react";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { getAuthToken } from "@/services/auth.service";

interface Permission {
  id: number;
  name: string;
  description?: string;
  group?: string;
}

interface Role {
  id: number;
  name: string;
  permissions: number[];
}

interface FormValues {
  name: string;
  permissions: number[];
}

const formSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  permissions: z.array(z.number()).min(1, "Selecciona al menos un permiso"),
});

const RoleManagementPage = () => {
  const [activeTab, setActiveTab] = useState("new");
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [roleName, setRoleName] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      permissions: [],
    },
  });

  const formatPermissionName = (permission: string): string => {
    const permissionMap: Record<string, string> = {
      manage_users: "Administrar Usuarios",
      view_users: "Ver Usuarios",
      create_users: "Crear Usuarios",
      edit_users: "Editar Usuarios",
      delete_users: "Eliminar Usuarios",
      register_income: "Registrar Ingresos",
      view_income: "Ver Ingresos",
      edit_income: "Editar Ingresos",
      view_discounts: "Ver Descuentos",
      manage_discounts: "Administrar Descuentos",
      view_expenses: "Ver Gastos",
      manage_expenses: "Administrar Gastos",
      view_requests: "Ver Solicitudes",
      manage_requests: "Administrar Solicitudes",
      view_reports: "Ver Reportes",
      manage_reports: "Administrar Reportes",
      manage_special_income: "Administrar Ingresos Especiales",
      view_budget: "Ver Presupuesto",
      manage_budget: "Administrar Presupuesto",
      manage_provisions: "Administrar Provisiones",
      manage_support: "Administrar Soporte",
    };

    return (
      permissionMap[permission] ||
      permission
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    );
  };

  const groupedPermissions = useMemo(() => {
    if (!permissions.length) return {};

    return permissions.reduce((acc, permission) => {
      const group = permission.group || "General";
      if (!acc[group]) {
        acc[group] = [];
      }
      acc[group].push(permission);
      return acc;
    }, {} as Record<string, Permission[]>);
  }, [permissions]);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [rolesRes, permsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/roles`, {
          credentials: "include",
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/permissions`, {
          credentials: "include",
        }),
      ]);

      if (!rolesRes.ok || !permsRes.ok) {
        throw new Error("Error al cargar los datos");
      }

      const [rolesData, permsData] = await Promise.all([
        rolesRes.json(),
        permsRes.json(),
      ]);

      setRoles(Array.isArray(rolesData) ? rolesData : []);
      setPermissions(Array.isArray(permsData) ? permsData : []);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Error al cargar los datos");
      setRoles([]);
      setPermissions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (editingRole) {
      form.reset({
        name: editingRole.name,
        permissions: editingRole.permissions,
      });
    } else {
      form.reset({
        name: "",
        permissions: [],
      });
    }
  }, [editingRole, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      const endpoint = editingRole
        ? `${process.env.NEXT_PUBLIC_API_URL}/roles/${editingRole.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/roles`;

      const method = editingRole ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
        credentials: "include",
      });

      if (!response.ok) throw new Error("Error en la solicitud");

      toast.success(editingRole ? "Rol actualizado" : "Rol creado");
      form.reset({ name: "", permissions: [] });
      setEditingRole(null);
      setActiveTab("list");
      await loadData();
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Error al procesar la solicitud");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setActiveTab("new");
  };

  const handlePermissionChange = (permissionId: number) => {
    setSelectedPermissions((prev) => {
      if (prev.includes(permissionId)) {
        return prev.filter((id) => id !== permissionId);
      }
      return [...prev, permissionId];
    });
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/4 animate-pulse" />
          <div className="h-4 bg-slate-200 rounded w-1/3 animate-pulse" />
          <Card>
            <CardContent className="p-6 space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={`skeleton-${i}`} className="space-y-4">
                  <div className="h-4 bg-slate-100 rounded w-1/4 animate-pulse" />
                  <div className="h-12 bg-slate-100 rounded animate-pulse" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="container py-8 space-y-6"
    >
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">
            Gestión de Roles
          </h2>
          <p className="text-sm text-slate-500">
            Define los roles y sus permisos asociados
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="border-b px-6 pt-4">
              <TabsList className="bg-slate-100 p-1">
                <TabsTrigger
                  value="new"
                  className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm flex items-center gap-2"
                >
                  {editingRole ? (
                    <Edit2 className="h-4 w-4" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  {editingRole ? "Editar Rol" : "Nuevo Rol"}
                </TabsTrigger>
                <TabsTrigger
                  value="list"
                  className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
                >
                  Lista de Roles
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="new" className="m-0">
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="roleName">Nombre del Rol</Label>
                      <Input
                        id="roleName"
                        value={roleName}
                        onChange={(e) => setRoleName(e.target.value)}
                        placeholder="Ej: Administrador"
                      />
                    </div>

                    <div className="space-y-4">
                      <Label>Permisos</Label>
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Importante</AlertTitle>
                        <AlertDescription>
                          Selecciona cuidadosamente los permisos
                        </AlertDescription>
                      </Alert>

                      <ScrollArea className="h-[400px] pr-4">
                        <div className="space-y-6">
                          {Object.entries(groupedPermissions).map(
                            ([group, perms]) =>
                              perms && perms.length > 0 ? (
                                <div
                                  key={`group-${group}`}
                                  className="space-y-4"
                                >
                                  <div>
                                    <h4 className="text-sm font-medium text-slate-900 mb-1">
                                      {group}
                                    </h4>
                                    <Separator />
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {perms.map((permission) => (
                                      <div
                                        key={`perm-${permission.id}`}
                                        className="flex items-center space-x-2 bg-slate-50 p-3 rounded-lg hover:bg-slate-100 transition-colors"
                                      >
                                        <Checkbox
                                          id={`permission-${permission.id}`}
                                          checked={selectedPermissions.includes(
                                            permission.id
                                          )}
                                          onCheckedChange={() =>
                                            handlePermissionChange(
                                              permission.id
                                            )
                                          }
                                        />
                                        <Label
                                          htmlFor={`permission-${permission.id}`}
                                          className="text-sm cursor-pointer"
                                        >
                                          {formatPermissionName(
                                            permission.name
                                          )}
                                        </Label>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ) : null
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      className="bg-red-600 hover:bg-red-700"
                      disabled={isLoading}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {isLoading
                        ? "Guardando..."
                        : editingRole
                        ? "Actualizar Rol"
                        : "Crear Rol"}
                    </Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="list" className="m-0">
                <div className="space-y-6">
                  {Array.isArray(roles) && roles.length > 0 ? (
                    roles.map((role) => (
                      <Card key={`role-${role.id}`}>
                        <CardHeader className="bg-slate-50">
                          <div className="flex items-center justify-between">
                            <CardTitle>{role.name}</CardTitle>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingRole(role);
                                setActiveTab("new");
                              }}
                            >
                              <Edit2 className="h-4 w-4 mr-2" />
                              Editar
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                          <div className="flex flex-wrap gap-2">
                            {Array.isArray(role.permissions) &&
                              role.permissions.map((permId) => {
                                const permission = permissions.find(
                                  (p) => p.id === permId
                                );
                                return permission ? (
                                  <Badge
                                    key={`role-${role.id}-perm-${permId}`}
                                    variant="secondary"
                                  >
                                    {formatPermissionName(permission.name)}
                                  </Badge>
                                ) : null;
                              })}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      No hay roles definidos
                    </div>
                  )}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RoleManagementPage;
