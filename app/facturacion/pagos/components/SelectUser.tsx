"use client";
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import api from "@/services/axios";

interface Props {
  name: string;
  nombre_completo: string;
  label?: string;
  register: any;
  error?: string;
}

export function SelectUser({
  name,
  nombre_completo,
  label = "Empleado",
  register,
  error,
}: Props) {
  const [users, setUsers] = useState<
    { id: number; name: string; nombre_completo: string }[]
  >([]);

  useEffect(() => {
    api.get("/responsibles").then((res) => setUsers(res.data));
  }, []);

  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <select
        id={name}
        {...register(name)}
        className="w-full mt-1 border rounded px-2 py-2"
      >
        <option value="">Selecciona...</option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.nombre_completo}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
