import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { apiService } from "@/services/api.service";
import { type ProjectsDialogProps, type Project } from "@/types/dialogs";

export const ProjectsDialog = ({
  user,
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: ProjectsDialogProps) => {
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [projectInput, setProjectInput] = useState<string>("");
  const [availableProjects, setAvailableProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);

  // Cargar proyectos cuando se abre el diálogo
  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoadingProjects(true);
      try {
        const response = await apiService.getProjects();
        const projects = response.data;
        console.log("PROYECTOS!!!!", projects);
        setAvailableProjects(projects);
      } catch (error) {
        console.error("Error fetching projects:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Error al cargar los proyectos"
        );
        throw error;
      } finally {
        setIsLoadingProjects(false);
      }
    };

    if (isOpen) {
      fetchProjects();
    }
  }, [isOpen]);

  // Cargar proyectos seleccionados del usuario
  useEffect(() => {
    if (user && user.projects) {
      setSelectedProjects(user.projects.map((p: Project) => p.id));
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(selectedProjects);
  };

  const handleClose = () => {
    setSelectedProjects([]);
    setProjectInput("");
    onClose();
  };

  const handleProjectInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setProjectInput(newValue);

    const project = availableProjects.find(
      (p) => p.id === newValue || p.name === newValue
    );

    if (project && !selectedProjects.includes(project.id)) {
      setSelectedProjects((prev) => [...prev, project.id]);
      setProjectInput("");
    }
  };

  const handleProjectKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmed = projectInput.trim();

      if (trimmed === "*") {
        const allProjectIds = availableProjects.map((p) => p.id);
        setSelectedProjects(allProjectIds);
      } else {
        const project = availableProjects.find(
          (p) => p.id === trimmed || p.name === trimmed
        );

        if (project && !selectedProjects.includes(project.id)) {
          setSelectedProjects((prev) => [...prev, project.id]);
        }
      }
      setProjectInput("");
    }
  };

  const handleRemoveProject = (projectId: string) => {
    setSelectedProjects((prev) => prev.filter((id) => id !== projectId));
  };

  if (!user) return null;

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open && !isLoading) handleClose();
      }}
    >
      <DialogContent
        className="sm:max-w-[700px]"
        onEscapeKeyDown={(e) => {
          e.preventDefault();
          if (!isLoading) handleClose();
        }}
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Gestionar Proyectos</DialogTitle>
          <DialogDescription>
            Selecciona los proyectos para el usuario {user?.name}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              {isLoadingProjects ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
                </div>
              ) : (
                <>
                  <Input
                    id="projects"
                    name="projects"
                    placeholder="Agregar proyecto  (Escribe '*' y presiona Enter para seleccionar todos)"
                    list="projects-options"
                    value={projectInput}
                    onChange={handleProjectInputChange}
                    onKeyDown={handleProjectKeyDown}
                    autoComplete="off"
                    disabled={isLoading}
                  />
                  <datalist id="projects-options">
                    {availableProjects
                      .filter(
                        (project) => !selectedProjects.includes(project.id)
                      )
                      .map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                  </datalist>
                  <div className="flex flex-wrap gap-2">
                    {selectedProjects.map((projectId) => {
                      const project = availableProjects.find(
                        (p) => p.id === projectId
                      );
                      return (
                        <Badge
                          key={projectId}
                          variant="outline"
                          className="cursor-pointer hover:bg-slate-100"
                          onClick={() =>
                            !isLoading && handleRemoveProject(projectId)
                          }
                        >
                          {project
                            ? `${project.id} - ${project.name}`
                            : projectId}
                          <span className="ml-1">×</span>
                        </Badge>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading || isLoadingProjects}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || isLoadingProjects}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? "Guardando..." : "Asignar proyectos"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
