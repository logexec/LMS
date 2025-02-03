"use server";

import { getAuthToken } from "@/services/auth.service";

interface Project {
  id: string | number;
  proyecto: string;
}

interface ProjectApiResponse {
  data: Project[];
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
}

export const getProjects = async () => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URI}/projects`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Projects response:", response);

    if (!response.ok) {
      throw new Error(response.statusText || "Error al cargar los cargos");
    }

    const responseData: ProjectApiResponse = await response.json();

    console.log("Projects response data:", responseData);
  } catch (error) {
    console.error(error);
  }
};
