import Router from "next/router";
import { LoginResponse } from "@/utils/types";
import api from "./axios";

async function getCsrfCookie() {
  // 1) Pedimos la cookie XSRF-TOKEN que Laravel envía
  await api.get("/sanctum/csrf-cookie");
}

export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  await getCsrfCookie();
  const { data } = await api.post<LoginResponse>("/login", { email, password });
  // Guardamos usuario en localStorage
  localStorage.setItem("user", JSON.stringify(data.user));
  return data;
}

export async function logout(): Promise<void> {
  try {
    await api.post("/logout");
  } catch {
    // ignorar errores de logout
  }
  localStorage.removeItem("user");
  // forzamos redirección
  Router.replace("/login");
}
