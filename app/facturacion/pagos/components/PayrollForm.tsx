/* eslint-disable */
"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import api from "@/services/axios";
import { SelectUser } from "./SelectUser";

const formSchema = z.object({
  user_id: z.string().min(1, "Selecciona un empleado"),
  period_start: z.string().min(1, "Fecha de inicio requerida"),
  period_end: z.string().min(1, "Fecha de fin requerida"),
  basic_salary: z.coerce.number().min(0),
  bonuses: z.coerce.number().min(0).default(0),
  discounts: z.coerce.number().min(0).default(0),
});

type FormValues = z.infer<typeof formSchema>;

export function PayrollForm() {
  // const {
  //   register,
  //   handleSubmit,
  //   formState: { errors, isSubmitting },
  //   reset,
  // } = useForm<FormValues>({
  //   resolver: zodResolver(formSchema),
  //   defaultValues: {
  //     bonuses: 0,
  //     discounts: 0,
  //   },
  // });

  // const onSubmit = async (data: FormValues) => {
  //   toast.loading("Generando rol...");
  //   try {
  //     await api.post("/api/payrolls", data);
  //     toast.success("Rol generado y enviado por correo");
  //     reset();
  //   } catch (err) {
  //     console.error(err);
  //     toast.error("Ocurrió un error");
  //   }
  // };

  return (
    // <Card className="p-6 max-w-xl mx-auto space-y-4 rounded-2xl shadow-md">
    //   <h2 className="text-xl font-semibold">Nuevo Rol de Pago</h2>
    //   <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
    //     <SelectUser
    //       name="user_id"
    //       label="Empleado"
    //       register={register}
    //       error={errors.user_id?.message}
    //     />

    //     <div className="grid grid-cols-2 gap-4">
    //       <Input
    //         type="date"
    //         label="Inicio de período"
    //         {...register("period_start")}
    //       />
    //       <Input
    //         type="date"
    //         label="Fin de período"
    //         {...register("period_end")}
    //       />
    //     </div>

    //     <Input
    //       type="number"
    //       step="0.01"
    //       label="Sueldo básico"
    //       {...register("basic_salary")}
    //     />
    //     <Input
    //       type="number"
    //       step="0.01"
    //       label="Bonificaciones"
    //       {...register("bonuses")}
    //     />
    //     <Input
    //       type="number"
    //       step="0.01"
    //       label="Descuentos"
    //       {...register("discounts")}
    //     />

    //     <Button type="submit" disabled={isSubmitting} className="w-full">
    //       Generar y Enviar
    //     </Button>
    //   </form>
    // </Card>
    <>
    Dummy text
    </>
  );
}
