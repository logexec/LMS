import { isTokenExpiring, refreshToken } from "@/services/auth.service";

interface RequestConfig extends RequestInit {
  requiresAuth?: boolean;
}

async function apiClient(endpoint: string, config: RequestConfig = {}) {
  const { requiresAuth = true, ...requestConfig } = config;

  // Construir URL completa
  const url = `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`;

  // Si requiere autenticación, agregar headers
  if (requiresAuth) {
    const headers = new Headers(config.headers || {});

    // Verificar si el token está por expirar
    if (isTokenExpiring()) {
      try {
        await refreshToken();
      } catch (error) {
        // Si hay error al renovar el token, redirigir al login
        window.location.href = "/login";
        throw error;
      }
    }

    // Agregar tokens a los headers
    headers.set(
      "Authorization",
      `Bearer ${localStorage.getItem("access_token")}`
    );
    headers.set("X-JWT-Token", localStorage.getItem("jwt_token") || "");
    requestConfig.headers = headers;
  }

  // Realizar la petición
  try {
    const response = await fetch(url, requestConfig);

    // Si no está autorizado, redirigir al login
    if (response.status === 401) {
      window.location.href = "/login";
      throw new Error("No autorizado");
    }

    if (!response.ok) {
      throw new Error("Error en la petición");
    }

    return response.json();
  } catch (error) {
    console.error("API Client Error:", error);
    throw error;
  }
}

export default apiClient;
