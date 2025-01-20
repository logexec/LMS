import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { sidenavLinks } from "@/utils/constants";

const publicRoutes = ["/login"];
const ignoreRoutes = ["/_next", "/api", "/favicon.ico", "/static"];

function checkPathPermissions(
  pathname: string,
  permissions: string[]
): boolean {
  // Encontrar la ruta en sidenavLinks
  const route = sidenavLinks
    .flatMap((category) => category.links.find((link) => link.url === pathname))
    .find(Boolean);

  if (!route) return false;

  // Verificar permisos de la ruta
  const requiredPermissions = route.requiredPermissions || [];
  return requiredPermissions.some((permission) =>
    permissions.includes(permission)
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (ignoreRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  if (publicRoutes.includes(pathname)) {
    const token = request.cookies.get("jwt_token");
    if (token && pathname === "/login") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  const token = request.cookies.get("jwt_token")?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.url);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.APP_KEY || "default-secret-key")
    );

    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("jwt_token");
      response.cookies.delete("access_token");
      return response;
    }

    // Verificar permisos para la ruta actual
    const userPermissions = payload.permissions as string[];
    if (!checkPathPermissions(pathname, userPermissions)) {
      return new NextResponse(
        JSON.stringify({
          error: "Forbidden",
          message: "No tienes permiso para acceder a esta ruta",
        }),
        {
          status: 403,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware Error:", error);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
