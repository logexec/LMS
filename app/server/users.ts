// app/server/users.ts
import { Personal, PersonalForm } from "@/utils/types";

interface ApiResponseRaw {
  data: {
    usuario: string;
    permisos: string[];
  }[];
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
}

// Utility functions
const capitalize = (string: string = "") => {
  return string
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const extractName = (email: string) => {
  const [firstName, lastName] = email.split(".");
  if (!lastName) return capitalize(firstName);
  const last = lastName.split("@")[0];
  return `${capitalize(firstName)} ${capitalize(last)}`;
};

export async function fetchUsersData(page: number = 1) {
  const response = await fetch(`http://127.0.0.1:8000/api/users?page=${page}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Error: ${response.status}`);
  }

  const responseData: ApiResponseRaw = await response.json();

  return {
    data: responseData.data.map((user) => ({
      id: user.usuario,
      nombres: extractName(user.usuario),
      correo_electronico: user.usuario,
      usuario: user.usuario,
      permisos: user.permisos.map((p) => capitalize(p)),
    })),
    meta: responseData.meta,
  };
}

export async function createUser(newPersonal: PersonalForm) {
  const response = await fetch("http://127.0.0.1:8000/api/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newPersonal),
  });

  if (!response.ok) {
    throw new Error("Error al crear usuario");
  }

  return response;
}

export async function updateUser(updatedPersonal: PersonalForm) {
  const response = await fetch(
    `http://127.0.0.1:8000/api/users/${updatedPersonal.id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedPersonal),
    }
  );

  if (!response.ok) {
    throw new Error("Error al actualizar usuario");
  }

  return response;
}

export async function deleteUser(personal: Personal) {
  const response = await fetch(
    `http://127.0.0.1:8000/api/users/${personal.id}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Error al eliminar usuario");
  }

  return response;
}
