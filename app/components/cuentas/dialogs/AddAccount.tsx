"use client";
import { useState } from "react";
import { motion } from "motion/react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import apiService from "@/services/api.service";
import { toast } from "sonner";
import { AccountProps } from "@/utils/types";

interface AddAccountProps {
  setAccounts: React.Dispatch<React.SetStateAction<AccountProps[]>>;
}

const AddAccountComponent: React.FC<AddAccountProps> = ({ setAccounts }) => {
  const [formData, setFormData] = useState({
    name: "",
    account_number: "",
    account_type: "nomina",
    account_status: "active",
    account_affects: "discount",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const newAccount = await apiService.createAccount(formData);

      if (!newAccount || !newAccount.id) {
        throw new Error("La API no devolvió la cuenta creada");
      }

      toast.success("Cuenta creada exitosamente");

      // Agregar la cuenta al estado sin recargar la página
      setAccounts((prev) => [...prev, newAccount]);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al crear la cuenta");
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition">
        Agregar Cuenta
      </AlertDialogTrigger>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Agregar una nueva cuenta</AlertDialogTitle>
            <AlertDialogDescription>
              Completa los campos para registrar una cuenta nueva.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4">
            <Input
              name="name"
              placeholder="Nombre de la cuenta"
              onChange={handleChange}
            />
            <Input
              name="account_number"
              placeholder="Número de cuenta"
              onChange={handleChange}
            />
            <Select
              name="account_type"
              onValueChange={(value) =>
                setFormData({ ...formData, account_type: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo de cuenta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nomina">Nómina</SelectItem>
                <SelectItem value="transportista">Transportista</SelectItem>
              </SelectContent>
            </Select>
            <Select
              name="account_status"
              onValueChange={(value) =>
                setFormData({ ...formData, account_status: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Activa</SelectItem>
                <SelectItem value="inactive">Inactiva</SelectItem>
              </SelectContent>
            </Select>
            <Select
              name="account_affects"
              onValueChange={(value) =>
                setFormData({ ...formData, account_affects: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Corresponde a" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="discount">Descuentos</SelectItem>
                <SelectItem value="expense">Gastos</SelectItem>
                <SelectItem value="both">Ambos</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit}>
              Guardar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </motion.div>
    </AlertDialog>
  );
};

export default AddAccountComponent;
