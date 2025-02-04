import { useState } from "react";
import {
  type CreateUserDialogProps,
  type CreateUserFormData,
} from "@/types/dialogs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export const CreateUserDialog = ({
  isOpen,
  onClose,
  onSubmit,
  roles,
  isLoading,
}: CreateUserDialogProps) => {
  const [activeTab, setActiveTab] = useState("form");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [formData, setFormData] = useState<CreateUserFormData>({
    name: "",
    email: "",
    password: "L0g3X2025*",
    role_id: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Crear nuevo usuario</DialogTitle>
          <DialogDescription>
            Ingresa la información del nuevo usuario.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="form">Formulario Simple</TabsTrigger>
            <TabsTrigger value="advanced">Formulario Avanzado</TabsTrigger>
          </TabsList>

          <TabsContent value="form">
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Input
                    id="name"
                    name="name"
                    placeholder="Nombre completo"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Correo electrónico"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Select
                    value={formData.role_id}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, role_id: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un rol" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate
                          ? format(selectedDate, "PPP")
                          : "Fecha de nacimiento"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                          setSelectedDate(date);
                          if (date) {
                            setFormData((prev) => ({
                              ...prev,
                              dob: format(date, "yyyy-MM-dd"),
                            }));
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground">
                      La contraseña por defecto será:{" "}
                      <strong>L0g3X2025*</strong>
                    </p>
                  </CardContent>
                </Card>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isLoading ? "Creando..." : "Crear usuario"}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="advanced">
            <div className="py-4">
              <iframe
                src="/users/create"
                className="w-full h-[60vh] border-none"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                Cerrar
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
