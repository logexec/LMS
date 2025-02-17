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
        setAvailableProjects(Array.isArray(response) ? response : []);
      } catch (error) {
        console.error("Error fetching projects:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Error al cargar los proyectos"
        );
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
    if (user?.projects) {
      const projectIds = user.projects.map((p: Project) => p.id);
      setSelectedProjects(projectIds);
    } else {
      setSelectedProjects([]);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log("Submitting projects:", selectedProjects); // Debug log
      await onSubmit(selectedProjects);
    } catch (error) {
      console.error("Error updating projects:", error);
      toast.error("Error al actualizar los proyectos.");
    }
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
      (p) =>
        p.name.toLowerCase() === newValue.toLowerCase() || p.id === newValue
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
        setProjectInput("");
        return;
      }

      const project = availableProjects.find(
        (p) =>
          p.name.toLowerCase() === trimmed.toLowerCase() || p.id === trimmed
      );

      if (project && !selectedProjects.includes(project.id)) {
        setSelectedProjects((prev) => [...prev, project.id]);
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
      open={isOpen}
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
                        <option key={project.id} value={project.name}>
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
                          {project ? `${project.name}` : projectId}
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
              disabled={
                isLoading || isLoadingProjects || selectedProjects.length === 0
              }
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading
                ? "Guardando..."
                : selectedProjects.length > 1
                ? "Asignar proyectos"
                : "Asignar Proyecto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
