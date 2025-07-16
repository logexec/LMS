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
import { Checkbox } from "@/components/ui/checkbox";
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
    account_type: "nomina" as const,
    account_status: "active" as const,
    account_affects: "discount" as const,
    generates_income: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (
    field: "account_type" | "account_status" | "account_affects",
    value: string
  ) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData({ ...formData, generates_income: checked });
  };

  const handleSubmit = async () => {
    try {
      const newAccount = await apiService.createAccount(formData);
      if (!newAccount || !newAccount.id)
        throw new Error("Error al crear la cuenta");

      setAccounts((prev) => [newAccount, ...prev]);
      toast.success("Cuenta creada exitosamente");
      setFormData({
        name: "",
        account_number: "",
        account_type: "nomina",
        account_status: "active",
        account_affects: "discount",
        generates_income: false,
      });
    } catch (error) {
      toast.error("Error al crear la cuenta");
      console.error(error);
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
              value={formData.name}
              onChange={handleChange}
            />
            <Input
              name="account_number"
              placeholder="Número de cuenta"
              value={formData.account_number}
              onChange={handleChange}
            />
            <Select
              value={formData.account_type}
              onValueChange={(value) =>
                handleSelectChange("account_type", value)
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
              value={formData.account_status}
              onValueChange={(value) =>
                handleSelectChange("account_status", value)
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
              value={formData.account_affects}
              onValueChange={(value) =>
                handleSelectChange("account_affects", value)
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
            <div className="flex items-center space-x-2">
              <Checkbox
                id="generates_income"
                checked={formData.generates_income}
                onCheckedChange={handleCheckboxChange}
              />
              <label htmlFor="generates_income">Genera Ingreso</label>
            </div>
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
