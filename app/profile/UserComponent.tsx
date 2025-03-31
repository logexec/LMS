import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { EditIcon, User2Icon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogTitle,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTrigger,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import apiService from "@/services/api.service";
import { toast } from "sonner";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { User } from "@/utils/types";

interface Project {
  id: string;
  name: string;
  description?: string;
}

interface UserProfileComponentProps extends User {
  onProfileUpdate: () => void; // Callback para notificar al padre
}

const UserProfileComponent = ({
  id,
  name,
  email,
  dob,
  phone,
  role,
  onProfileUpdate,
}: UserProfileComponentProps) => {
  const [assignedProjects, setAssignedProjects] = useState<number[]>([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user")!);
    setAssignedProjects(user.assignedProjects || []);
  }, []);

  const { data: projects = [], isLoading: isLoadingProjects } = useQuery({
    queryKey: ["projects", assignedProjects], // Ahora depende de assignedProjects
    queryFn: async () => {
      if (!assignedProjects.length) return []; // Evita ejecutar con un array vacío

      try {
        const response = await apiService.getProjects();
        const projectsData = Array.isArray(response) ? response : [];

        console.log("userProjects:", assignedProjects);
        console.log("projectsData:", projectsData);

        const filteredProjects = projectsData.filter(
          (project) => assignedProjects.includes(project.id) // Correcta comparación
        );

        console.log("Filtered:", filteredProjects);

        return filteredProjects.map((project: Project) => ({
          ...project,
          name:
            project.name?.substring(0, 4).toUpperCase() || `PRJ-${project.id}`,
        }));
      } catch (error) {
        console.error("Error al cargar proyectos:", error);
        toast.error("Error al cargar los proyectos");
        return [];
      }
    },
    enabled: assignedProjects.length > 0,
    staleTime: 10 * 1000,
  });

  const [cumple, setCumple] = useState<Date | undefined>(
    dob ? new Date(dob) : undefined
  );
  const [telefono, setTelefono] = useState(phone || "");
  const [password, setPassword] = useState("");

  const updateProfileMutation = useMutation({
    mutationFn: async (data: {
      dob?: string;
      phone?: string;
      password?: string;
    }) => {
      const response = await apiService.updateUserProfile(id, data);
      return response;
    },
    onSuccess: () => {
      toast.success("Perfil actualizado correctamente");
      onProfileUpdate(); // Notificar al padre para invalidar la caché
    },
    onError: (error) => {
      console.error("Error actualizando perfil", error);
      toast.error("Error actualizando perfil");
    },
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const updateData: { dob?: string; phone?: string; password?: string } = {};

    const newDob = cumple?.toISOString().split("T")[0];
    if (newDob && newDob !== dob) updateData.dob = newDob;
    if (telefono && telefono !== phone) updateData.phone = telefono;
    if (password.trim()) updateData.password = password;

    if (Object.keys(updateData).length === 0) {
      toast.info("No hay cambios para guardar");
      return;
    }

    updateProfileMutation.mutate(updateData);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.3 } }}
      className="bg-white"
    >
      <section className="relative block" style={{ height: "500px" }}>
        <div
          className="absolute top-0 w-full h-full bg-center bg-cover rounded-t-xl bg-white"
          style={{
            backgroundColor: "#fff",
            backgroundImage:
              'url("https://images.unsplash.com/photo-1499336315816-097655dcfbda?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2710&q=80")',
          }}
        >
          <span className="w-full h-full absolute opacity-50 bg-black rounded-t-xl" />
        </div>
        <div
          className="top-auto bottom-0 left-0 right-0 w-full absolute pointer-events-none overflow-hidden"
          style={{ height: "70px", transform: "translateZ(0px)" }}
        >
          <svg
            className="absolute bottom-0 overflow-hidden"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            version="1.1"
            viewBox="0 0 2560 100"
            x="0"
            y="0"
          >
            <polygon
              className="text-gray-300 fill-current"
              points="2560 0 2560 100 0 100"
            ></polygon>
          </svg>
        </div>
      </section>

      <section className="relative py-16 bg-gray-200 rounded-b-xl">
        <div className="container mx-auto px-4">
          <div className="relative flex flex-col bg-white w-full mb-6 shadow-xl rounded-lg -mt-96">
            <div className="px-6">
              <div className="flex flex-wrap justify-center">
                <div className="w-full lg:w-3/12 px-4 flex justify-center">
                  <div className="relative">
                    <User2Icon className="shadow-xl rounded-full w-28 h-28 bg-white p-2 border border-slate-400 absolute -m-16" />
                  </div>
                </div>
                <motion.div
                  initial={{ opacity: 0, x: -100 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="w-full px-4 lg:text-center py-6 mt-32"
                >
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        type="button"
                        className="bg-red-500 active:bg-red-600 uppercase text-white font-bold hover:shadow-md text-xs px-4 py-2 rounded flex items-center gap-3"
                      >
                        <EditIcon className="mr-2" />
                        Editar
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Editar Información</AlertDialogTitle>
                      </AlertDialogHeader>
                      <AlertDialogDescription className="mb-4 text-sm text-gray-600">
                        No te preocupes si dejas algún campo vacío; no son
                        obligatorios ni se va a borrar nada.
                      </AlertDialogDescription>
                      <form
                        onSubmit={handleProfileUpdate}
                        className="space-y-4"
                      >
                        <div className="flex flex-col">
                          <Label htmlFor="dob" className="mb-1">
                            Fecha de Nacimiento
                          </Label>
                          <input
                            type="date"
                            id="dob"
                            value={
                              cumple ? cumple.toISOString().split("T")[0] : ""
                            }
                            onChange={(e) => {
                              const dateValue = e.target.value;
                              if (dateValue) {
                                setCumple(new Date(dateValue));
                              } else {
                                setCumple(undefined);
                              }
                            }}
                            max={
                              new Date(
                                new Date().setFullYear(
                                  new Date().getFullYear() - 18
                                )
                              )
                                .toISOString()
                                .split("T")[0]
                            }
                            className="px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
                          />
                        </div>
                        <div className="flex flex-col">
                          <Label htmlFor="phone" className="mb-1">
                            Teléfono
                          </Label>
                          <input
                            type="text"
                            id="phone"
                            value={telefono}
                            onChange={(e) => setTelefono(e.target.value)}
                            placeholder="Ingresa tu teléfono"
                            className="px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
                          />
                        </div>
                        <div className="flex flex-col">
                          <Label htmlFor="password" className="mb-1">
                            Nueva Contraseña
                          </Label>
                          <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Ingresa nueva contraseña"
                            className="px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
                          />
                        </div>
                        <AlertDialogFooter className="pt-4">
                          <AlertDialogAction asChild>
                            <button
                              type="submit"
                              className="uppercase font-bold text-xs px-4 py-2 rounded focus:outline-none"
                              disabled={updateProfileMutation.isPending}
                            >
                              {updateProfileMutation.isPending
                                ? "Guardando..."
                                : "Guardar"}
                            </button>
                          </AlertDialogAction>
                          <AlertDialogCancel asChild>
                            <button
                              type="button"
                              className="uppercase text-gray-800 font-bold text-xs px-4 py-2 rounded focus:outline-none"
                            >
                              Cancelar
                            </button>
                          </AlertDialogCancel>
                        </AlertDialogFooter>
                      </form>
                    </AlertDialogContent>
                  </AlertDialog>
                </motion.div>
              </div>
              <div className="text-center mt-12">
                <h3 className="text-4xl font-semibold text-gray-800">{name}</h3>
                <div className="text-sm text-gray-500 font-bold uppercase mb-2">
                  {role.name}
                </div>
                <div className="mb-2 text-red-700">{email}</div>
                <div className="text-sm text-gray-500 font-semibold">
                  {telefono || "Aún no has agregado un número de teléfono."}
                </div>
                <div className="mt-10">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Proyectos asignados:
                  </h3>
                  {isLoadingProjects ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
                      <span className="ml-2">Cargando proyectos...</span>
                    </div>
                  ) : projects.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground">
                        No tienes proyectos asignados todavía.
                      </p>
                    </div>
                  ) : (
                    <ScrollArea
                      className={`${
                        projects.length > 12 ? "h-[340px]" : "h-auto py-8"
                      } pr-4 shadow-inner border-y border-slate-200 rounded`}
                    >
                      <ul className="space-y-3 columns-3">
                        {projects.map((project: Project) => (
                          <li
                            key={project.id}
                            className="flex items-center space-x-2 py-1"
                          >
                            <Label
                              htmlFor={`project-${project.id}`}
                              className="flex-1 cursor-pointer"
                            >
                              <span className="font-medium text-red-600">
                                {project.name}
                              </span>
                              {project.description && (
                                <p className="text-xs text-muted-foreground">
                                  {project.description}
                                </p>
                              )}
                            </Label>
                          </li>
                        ))}
                      </ul>
                    </ScrollArea>
                  )}
                </div>
              </div>
              <div className="mt-10 py-10 border-t border-gray-300 text-center">
                <div className="flex flex-wrap justify-center">
                  <div className="w-full lg:w-9/12 px-4">
                    <p className="mb-4 text-lg text-gray-800 leading-relaxed">
                      Te damos la bienvenida a tu perfil de usuario. Aquí podrás
                      ver la información relacionada a tu cuenta. Puedes
                      editarla en cualquier momento.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default UserProfileComponent;
