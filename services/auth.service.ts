/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/lib/api";

export const login = async ({
  email,
  password,
  remember,
}: {
  email: string;
  password: string;
  remember?: boolean;
}) => {
  const response = await api.post("/login", { email, password, remember });
  return response.data;
};

export const logout = async () => {
  await api.post("/logout");
};

// ⚠️ TEMPORAL — para compatibilidad con archivos antiguos
export const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  const tokenMatch = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
  return tokenMatch ? decodeURIComponent(tokenMatch[1]) : null;
};

export const fetchWithAuth = async (
  url: string,
  options: RequestInit = {}
): Promise<any> => {
  const token = getAuthToken();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  });
  return response.json();
};

export const fetchWithAuthFormData = async (
  url: string,
  formData: FormData,
  method: "POST" | "PUT" = "POST"
): Promise<any> => {
  const token = getAuthToken();
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}${url}`,
    {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
      credentials: "include",
    }
  );
  return response.json();
};
