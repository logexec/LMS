import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Lista de rutas públicas
const publicRoutes = ["/login"];

// Lista de rutas que ignoran completamente el middleware
const ignoreRoutes = ["/_next", "/api", "/favicon.ico", "/static"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignorar rutas específicas
  if (ignoreRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Permitir rutas públicas
  if (publicRoutes.includes(pathname)) {
    // Si el usuario ya está autenticado y trata de acceder al login,
    // redirigir al dashboard
    const token = request.cookies.get("jwt_token");
    if (token && pathname === "/login") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // Verificar autenticación para rutas protegidas
  const token = request.cookies.get("jwt_token")?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    // Guardar la URL actual para redirigir después del login
    loginUrl.searchParams.set("callbackUrl", request.url);
    return NextResponse.redirect(loginUrl);
  }

  try {
    // Verificar que el token sea válido
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.APP_KEY || "default-secret-key")
    );

    // Verificar si el token está expirado
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      // Limpiar cookies y redirigir al login
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("jwt_token");
      response.cookies.delete("access_token");
      return response;
    }

    // El token es válido, permitir la petición
    return NextResponse.next();
  } catch (error) {
    console.error("Middleware Error:", error);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

// Configurar qué rutas deben pasar por el middleware
export const config = {
  matcher: [
    // Aplicar a todas las rutas excepto las ignoradas
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
